"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DEFAULT_LOCATION, SUGGESTED_PROMPTS } from "@/lib/constants";
import { createId } from "@/lib/utils";
import { useLocation } from "@/hooks/useLocation";
import type { ApiResponse } from "@/types/api";
import type { ChatMessage, ChatResponse } from "@/types/chat";
import type { PersonaId } from "@/types/persona";
import type { ReasoningResult } from "@/types/recommendation";
import type { VisionScene } from "@/types/vision";

export type WorkflowStatus =
  | "idle"
  | "image-ready"
  | "analyzing"
  | "scene-ready"
  | "reasoning"
  | "ready"
  | "chatting"
  | "error";

type RetryAction =
  | {
      kind: "vision";
      file: File;
    }
  | {
      kind: "reasoning";
      prompt: string;
      persona: PersonaId;
      addConversation: boolean;
      destinationQuery?: string;
    }
  | {
      kind: "chat";
      message: string;
      conversation: ChatMessage[];
    }
  | null;

interface VisionApiData {
  scene: VisionScene;
  visionSummary: {
    sceneType: string;
    summary: string;
  };
  confidence: number;
}

export function useCityMind() {
  const { location, permissionState, requestLocation } = useLocation();
  const [persona, setPersonaState] = useState<PersonaId>("tourist");
  const [status, setStatus] = useState<WorkflowStatus>("idle");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scene, setScene] = useState<VisionScene | null>(null);
  const [result, setResult] = useState<ReasoningResult | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string>("");
  const [lastDestinationQuery, setLastDestinationQuery] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retryAction, setRetryAction] = useState<RetryAction>(null);

  const workflowVersionRef = useRef(0);
  const mapLocation = location ?? DEFAULT_LOCATION;

  const suggestedPrompts = useMemo(() => {
    if (!scene) {
      return [...SUGGESTED_PROMPTS];
    }

    return [
      "Which entrance is best for me?",
      "Can I avoid stairs?",
      "What should I verify first?",
      "What should I do if this route is crowded?"
    ];
  }, [scene]);

  const analyzeSelectedImage = useCallback(
    async (file: File) => {
      const requestVersion = ++workflowVersionRef.current;
      setStatus("analyzing");
      setError(null);
      setRetryAction(null);
      setResult(null);
      setScene(null);

      const formData = new FormData();
      formData.append("image", file);
      if (location) {
        formData.append("location", JSON.stringify(location));
      }

      try {
        const data = await postForm<VisionApiData>("/api/vision", formData);

        if (requestVersion !== workflowVersionRef.current) {
          return;
        }

        setScene(data.scene);
        setStatus("scene-ready");
      } catch (apiError) {
        if (requestVersion !== workflowVersionRef.current) {
          return;
        }

        setError(getClientError(apiError));
        setRetryAction({ kind: "vision", file });
        setStatus("error");
      }
    },
    [location]
  );

  const selectImage = useCallback((file: File) => {
    workflowVersionRef.current += 1;
    setImageFile(file);
    setStatus("image-ready");
    setError(null);
    setRetryAction(null);
    setScene(null);
    setResult(null);
    setChatMessages([]);
    setLastPrompt("");
    setLastDestinationQuery("");
    setImagePreview((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return URL.createObjectURL(file);
    });
  }, []);

  const confirmImage = useCallback(() => {
    if (!imageFile) {
      setError("Choose a photo before asking CityMind to analyze it.");
      setStatus("error");
      return;
    }

    void analyzeSelectedImage(imageFile);
  }, [analyzeSelectedImage, imageFile]);

  const clearImage = useCallback(() => {
    workflowVersionRef.current += 1;
    setImageFile(null);
    setImagePreview((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return null;
    });
    setScene(null);
    setResult(null);
    setChatMessages([]);
    setLastPrompt("");
    setLastDestinationQuery("");
    setError(null);
    setRetryAction(null);
    setStatus("idle");
  }, []);

  const submitPrompt = useCallback(
    async (
      prompt: string,
      nextPersona = persona,
      addConversation = true,
      destinationQuery?: string
    ) => {
      if (!scene) {
        setError("Capture or upload an image before asking CityMind.");
        setRetryAction(null);
        setStatus("error");
        return;
      }

      const trimmed = prompt.trim();

      if (!trimmed) {
        setError("Ask a question before requesting a recommendation.");
        setRetryAction(null);
        setStatus("error");
        return;
      }

      const normalizedDestination = destinationQuery?.trim();
      const userPrompt = normalizedDestination
        ? `${trimmed}\n\nDestination: ${normalizedDestination}`
        : trimmed;

      const requestVersion = ++workflowVersionRef.current;
      setStatus("reasoning");
      setError(null);
      setRetryAction(null);
      setLastPrompt(trimmed);
      setLastDestinationQuery(normalizedDestination ?? "");

      try {
        const reasoning = await postJson<ReasoningResult>("/api/reason", {
          scene,
          persona: nextPersona,
          userPrompt,
          location,
          destinationQuery: normalizedDestination || undefined
        });

        if (requestVersion !== workflowVersionRef.current) {
          return;
        }

        setResult(reasoning);
        setStatus("ready");

        if (addConversation) {
          const now = new Date().toISOString();
          setChatMessages((messages) => [
            ...messages,
            {
              id: createId("msg"),
              role: "user",
              content: trimmed,
              createdAt: now
            },
            {
              id: createId("msg"),
              role: "assistant",
              content: reasoning.recommendations[0]?.recommendation ?? reasoning.reasoning,
              createdAt: new Date().toISOString()
            }
          ]);
        }
      } catch (apiError) {
        if (requestVersion !== workflowVersionRef.current) {
          return;
        }

        setError(getClientError(apiError));
        setRetryAction({
          kind: "reasoning",
          prompt: trimmed,
          persona: nextPersona,
          addConversation,
          destinationQuery: normalizedDestination
        });
        setStatus("error");
      }
    },
    [location, persona, scene]
  );

  const selectPersona = useCallback(
    (nextPersona: PersonaId) => {
      setPersonaState(nextPersona);

      if (scene && lastPrompt) {
        void submitPrompt(lastPrompt, nextPersona, false, lastDestinationQuery);
      }
    },
    [lastDestinationQuery, lastPrompt, scene, submitPrompt]
  );

  const sendChatMessage = useCallback(
    async (message: string, conversationOverride?: ChatMessage[]) => {
      const trimmed = message.trim();

      if (!trimmed) {
        return;
      }

      const conversation = conversationOverride ?? chatMessages;
      const requestVersion = ++workflowVersionRef.current;

      const userMessage: ChatMessage = {
        id: createId("msg"),
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString()
      };

      if (!conversationOverride) {
        setChatMessages((messages) => [...messages, userMessage]);
      }
      setStatus("chatting");
      setError(null);
      setRetryAction(null);

      try {
        const response = await postJson<ChatResponse>("/api/chat", {
          conversation,
          latestMessage: trimmed,
          persona,
          scene: scene ?? undefined,
          recommendation: result ?? undefined
        });

        if (requestVersion !== workflowVersionRef.current) {
          return;
        }

        setChatMessages((messages) => [
          ...messages,
          {
            id: createId("msg"),
            role: "assistant",
            content: response.message,
            createdAt: new Date().toISOString()
          }
        ]);
        setStatus(result ? "ready" : "scene-ready");
      } catch (apiError) {
        if (requestVersion !== workflowVersionRef.current) {
          return;
        }

        setError(getClientError(apiError));
        setRetryAction({ kind: "chat", message: trimmed, conversation });
        setStatus("error");
      }
    },
    [chatMessages, persona, result, scene]
  );

  const retry = useCallback(() => {
    if (!retryAction) {
      setStatus(imageFile ? "image-ready" : "idle");
      setError(null);
      return;
    }

    if (retryAction.kind === "vision") {
      void analyzeSelectedImage(retryAction.file);
      return;
    }

    if (retryAction.kind === "reasoning") {
      void submitPrompt(
        retryAction.prompt,
        retryAction.persona,
        retryAction.addConversation,
        retryAction.destinationQuery
      );
      return;
    }

    void sendChatMessage(retryAction.message, retryAction.conversation);
  }, [analyzeSelectedImage, imageFile, retryAction, sendChatMessage, submitPrompt]);

  const retryDetails = useMemo(() => {
    if (retryAction?.kind === "vision") {
      return {
        label: "Retry scene analysis",
        description: "We will analyze the photo you already selected."
      };
    }

    if (retryAction?.kind === "reasoning") {
      return {
        label: "Retry recommendation",
        description: "We will use the same scene, question, and persona."
      };
    }

    if (retryAction?.kind === "chat") {
      return {
        label: "Retry reply",
        description: "We will resend your last follow-up without duplicating it."
      };
    }

    return {
      label: "Try again",
      description: "You can continue from the last completed step."
    };
  }, [retryAction]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return {
    persona,
    status,
    imagePreview,
    scene,
    result,
    chatMessages,
    error,
    location: mapLocation,
    hasDeviceLocation: Boolean(location),
    permissionState,
    suggestedPrompts,
    lastPrompt,
    lastDestinationQuery,
    retryDetails,
    requestLocation,
    selectPersona,
    selectImage,
    confirmImage,
    clearImage,
    submitPrompt,
    sendChatMessage,
    retry,
    setLastPrompt
  };
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  return parseApiResponse<T>(response);
}

async function postForm<T>(url: string, body: FormData): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    body
  });

  return parseApiResponse<T>(response);
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiResponse<T>;

  if (!payload.success) {
    throw new Error(payload.error.message);
  }

  return payload.data;
}

function getClientError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please retry.";
}
