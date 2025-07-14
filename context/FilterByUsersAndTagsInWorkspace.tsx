"use client";

import { FilterUser, UserActiveItemList } from "@/types/extended";
import { Tag } from "@prisma/client";
import { createContext, useContext, useEffect, useState } from "react";
import { useUserActivityStatus } from "./UserActivityStatus";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next-intl/client";

interface Props {
  children: React.ReactNode;
}

interface FilterByUsersAndTagsInWorkspaceContext {
  isLoading: boolean;
  isError: boolean;
  allTags: Tag[] | undefined;
  allUsers: UserActiveItemList[];
  filterAssignedUsers: FilterUser[];
  filterTags: Tag[];
  onChangeAssignedUser: (userId: string) => void;
  onChangeFilterTags: (tagId: string) => void;
  onClearUser: (userId: string) => void;
  onClearTag: (tagId: string) => void;
  onClearAll: () => void;
}

export const FilterByUsersAndTagsInWorkspaceCtx =
  createContext<FilterByUsersAndTagsInWorkspaceContext | null>(null);

export const FilterByUsersAndTagsInWorkspaceProvider = ({
  children,
}: Props) => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tagIdParam = searchParams.get("tagId");
  const workspaceId = params.workspace_id ? params.workspace_id : null;
  const {
    allUsers,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useUserActivityStatus();

  const [currentFilteredAssignedToUsers, setCurrentFilteredAssignedToUsers] =
    useState<FilterUser[]>([]);

  const [currentFilteredTags, setCurrentFilteredTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(true);

  const {
    data: tags,
    isLoading: isTagsLoading,
    isError: isTagsError,
  } = useQuery({
    queryFn: async () => {
      const res = await fetch(
        `/api/tags/get/get_workspace_tags?workspaceId=${workspaceId}`
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      return data as Tag[];
    },
    queryKey: ["getWorkspaceFilterTags"],
  });

  useEffect(() => {
    if (!tagIdParam && !tags) return;

    const isAlreadyFiltered = currentFilteredTags.some(
      (tag) => tag.id === tagIdParam
    );
    if (isAlreadyFiltered) return;

    const tagToAdd = tags?.find((tag) => tag.id === tagIdParam);

    if (tagToAdd) {
      setCurrentFilteredTags((prevTags) => {
        return [...prevTags, tagToAdd];
      });
    }
    router.replace(`/dashboard/workspace/${workspaceId}`);
  }, [tagIdParam, tags, currentFilteredTags, workspaceId, router]);

  useEffect(() => {
    if (isTagsError || isUsersError) setIsError(true);
    else setIsError(false);
  }, [isUsersError, isTagsError]);

  useEffect(() => {
    if (isTagsLoading || isUsersLoading) setIsLoading(true);
    else setIsLoading(false);
  }, [isUsersLoading, isTagsLoading]);

  const onChangeAssignedUserToFilterHandler = (userId: string) => {
    const isAlreadyFiltered = currentFilteredAssignedToUsers.some(
      (currentUser) => currentUser.id === userId
    );

    if (isAlreadyFiltered) {
      setCurrentFilteredAssignedToUsers((prevUsers) => {
        return prevUsers.filter((user) => user.id !== userId);
      });
    } else {
      const userToAdd = allUsers.find((user) => user.id === userId);

      if (userToAdd) {
        setCurrentFilteredAssignedToUsers((prevUsers) => {
          return [
            ...prevUsers,
            {
              id: userToAdd.id,
              image: userToAdd.image,
              username: userToAdd.username,
            },
          ];
        });
      }
    }
  };

  const onChangeFilterTagsHandler = (tagId: string) => {
    if (!tags) return;

    const isAlreadyFiltered = currentFilteredTags.some(
      (tag) => tag.id === tagId
    );

    if (isAlreadyFiltered) {
      setCurrentFilteredTags((prevTags) => {
        return prevTags.filter((tag) => tag.id !== tagId);
      });
    } else {
      const tagToAdd = tags.find((tag) => tag.id === tagId);

      if (tagToAdd) {
        setCurrentFilteredTags((prevTags) => {
          return [...prevTags, tagToAdd];
        });
      }
    }
  };
  const onClearUserHandler = (userId: string) => {
    setCurrentFilteredAssignedToUsers((prevUsers) => {
      return prevUsers.filter((user) => user.id !== userId);
    });
  };

  const onClearTagHandler = (tagId: string) => {
    setCurrentFilteredTags((prevTags) => {
      return prevTags.filter((tag) => tag.id !== tagId);
    });
  };

  const onClearAllHandler = () => {
    setCurrentFilteredAssignedToUsers([]);
    setCurrentFilteredTags([]);
  };

  return (
    <FilterByUsersAndTagsInWorkspaceCtx.Provider
      value={{
        allUsers: allUsers,
        allTags: tags,
        isError,
        isLoading,
        filterTags: currentFilteredTags,
        filterAssignedUsers: currentFilteredAssignedToUsers,
        onChangeAssignedUser: onChangeAssignedUserToFilterHandler,
        onChangeFilterTags: onChangeFilterTagsHandler,
        onClearAll: onClearAllHandler,
        onClearTag: onClearTagHandler,
        onClearUser: onClearUserHandler,
      }}
    >
      {children}
    </FilterByUsersAndTagsInWorkspaceCtx.Provider>
  );
};

export const useFilterByUsersAndTagsInWorkspace = () => {
  const ctx = useContext(FilterByUsersAndTagsInWorkspaceCtx);
  if (!ctx) throw new Error("invalid use");

  return ctx;
};
