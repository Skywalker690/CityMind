"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DEFAULT_LOCATION, SUGGESTED_PROMPTS } from "@/lib/constants";
import { createId } from "@/lib/utils";
import { useLocation } from "@/hooks/useLocation";
import type { ApiResponse } from "@/types/api";
import type { ChatMessage, ChatResponse } from "@/types/chat";
import type { PersonaId } from "@/types/persona";
import type { ReasoningResult } from "@/types/recommendation";
import type { VisionScene } from "@/types/vision";

type WorkflowStatus =
  | "idle"
  | "image-ready"
  | "analyzing"
  | "scene-ready"
  | "reasoning"
  | "ready"
  | "chatting"
  | "error";

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
  const [lastPrompt, setLastPrompt] = useState<string>(SUGGESTED_PROMPTS[0]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const activeLocation = location ?? DEFAULT_LOCATION;

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
      setStatus("analyzing");
      setError(null);
      setResult(null);
      setScene(null);

      const formData = new FormData();
      formData.append("image", file);
      formData.append("location", JSON.stringify(activeLocation));

      try {
        const data = await postForm<VisionApiData>("/api/vision", formData);
        setScene(data.scene);
        setStatus("scene-ready");
      } catch (apiError) {
        setError(getClientError(apiError));
        setStatus("error");
      }
    },
    [activeLocation]
  );

  const selectImage = useCallback(
    (file: File) => {
      setImageFile(file);
      setStatus("image-ready");
      setError(null);
      setImagePreview((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }

        return URL.createObjectURL(file);
      });
      void analyzeSelectedImage(file);
    },
    [analyzeSelectedImage]
  );

  const clearImage = useCallback(() => {
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
    setError(null);
    setStatus("idle");
  }, []);

  const submitPrompt = useCallback(
    async (prompt: string, nextPersona = persona, addConversation = true) => {
      if (!scene) {
        setError("Capture or upload an image before asking CityMind.");
        setStatus("error");
        return;
      }

      const trimmed = prompt.trim();

      if (!trimmed) {
        setError("Ask a question before requesting a recommendation.");
        setStatus("error");
        return;
      }

      setStatus("reasoning");
      setError(null);
      setLastPrompt(trimmed);

      try {
        const reasoning = await postJson<ReasoningResult>("/api/reason", {
          scene,
          persona: nextPersona,
          userPrompt: trimmed,
          location: activeLocation
        });
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
        setError(getClientError(apiError));
        setStatus("error");
      }
    },
    [activeLocation, persona, scene]
  );

  const selectPersona = useCallback(
    (nextPersona: PersonaId) => {
      setPersonaState(nextPersona);

      if (scene && lastPrompt) {
        void submitPrompt(lastPrompt, nextPersona, false);
      }
    },
    [lastPrompt, scene, submitPrompt]
  );

  const sendChatMessage = useCallback(
    async (message: string) => {
      const trimmed = message.trim();

      if (!trimmed) {
        return;
      }

      const userMessage: ChatMessage = {
        id: createId("msg"),
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString()
      };

      setChatMessages((messages) => [...messages, userMessage]);
      setStatus("chatting");
      setError(null);

      try {
        const response = await postJson<ChatResponse>("/api/chat", {
          conversation: chatMessages,
          latestMessage: trimmed,
          persona,
          scene: scene ?? undefined,
          recommendation: result ?? undefined
        });
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
        setError(getClientError(apiError));
        setStatus("error");
      }
    },
    [chatMessages, persona, result, scene]
  );

  const retry = useCallback(() => {
    if (imageFile) {
      void analyzeSelectedImage(imageFile);
    } else {
      setStatus("idle");
      setError(null);
    }
  }, [analyzeSelectedImage, imageFile]);

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
    location: activeLocation,
    permissionState,
    suggestedPrompts,
    lastPrompt,
    requestLocation,
    selectPersona,
    selectImage,
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
