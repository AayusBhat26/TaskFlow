"use client";

import { createContext, useContext, useReducer, ReactNode, Reducer } from "react";
import { Session } from "next-auth";
import { UseCase } from "@prisma/client";
import {
  Action,
  ActionType,
  OnboardingFormContext,
  OnboardingFormReducer,
} from "@/types/onBoardingContext";

// Create context with a default placeholder
export const OnboardingFormCtx = createContext<OnboardingFormContext | null>(
  null
);

// Reducer function
const onboardingFormReducer: Reducer<OnboardingFormReducer, Action> = (
  state,
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case ActionType.CHANGE_SITE:
      return { ...state, currentStep: payload as OnboardingFormReducer["currentStep"] };
    case ActionType.NAME:
      return { ...state, name: payload as string };
    case ActionType.SURNAME:
      return { ...state, surname: payload as string };
    case ActionType.USECASE:
      return { ...state, useCase: payload as UseCase };
    case ActionType.PROFILEIMAGE:
      return { ...state, profileImage: payload as string | null };
    case ActionType.WORKSPACE_NAME:
      return { ...state, workspaceName: payload as string };
    case ActionType.WORKSPACE_IMAGE:
      return { ...state, workspaceImage: payload as string | null };
    case ActionType.LEETCODE_USERNAME:
      return { ...state, leetcodeUsername: payload as string | null };
    case ActionType.CODEFORCES_USERNAME:
      return { ...state, codeforcesUsername: payload as string | null };
    case ActionType.REDDIT_USERNAME:
      return { ...state, redditUsername: payload as string | null };
    case ActionType.GITHUB_USERNAME:
      return { ...state, githubUsername: payload as string | null };
    case ActionType.EMAIL_IDS:
      return { ...state, emailIds: payload as string[] };
    default:
      return state;
  }
};

interface OnboardingFormProviderProps {
  children: ReactNode;
  session: Session;
}

// Initial form state
const initialFormState: OnboardingFormReducer = {
  currentStep: 1,
  name: null,
  surname: null,
  profileImage: null,
  useCase: null,
  workspaceName: "",
  workspaceImage: null,
  leetcodeUsername: null,
  codeforcesUsername: null,
  redditUsername: null,
  githubUsername: null,
  emailIds: [],
};

export const OnboardingFormProvider = ({
  children,
  session,
}: OnboardingFormProviderProps) => {
  // Merge session defaults into initial state
  const sessionState: OnboardingFormReducer = {
    ...initialFormState,
    name: session.user.name ?? null,
    surname: session.user.surname ?? null,
    profileImage: session.user.image ?? null,
  };

  // Use reducer without explicit type parameters (inferred)
  const [state, dispatch] = useReducer(
    onboardingFormReducer,
    sessionState
  );

  return (
    <OnboardingFormCtx.Provider value={{ ...state, dispatch }}>
      {children}
    </OnboardingFormCtx.Provider>
  );
};

// Custom hook for consuming context
export const useOnboardingForm = () => {
  const context = useContext(OnboardingFormCtx);
  if (!context) {
    throw new Error(
      "useOnboardingForm must be used within an OnboardingFormProvider"
    );
  }
  return context;
};
