import { v4 as uuidv4 } from "uuid";
import { Tag, CreateTagDto, UpdateTagDto } from "../types/tag";
import { readData, writeData } from "./fileStorageService";

const TAGS_FILE = "tags.json";

// Helper function to read tags
const readTags = async (): Promise<Tag[]> => {
  try {
    return await readData<Tag[]>(TAGS_FILE);
  } catch (error) {
    return [];
  }
};

// Helper function to write tags
const writeTags = async (tags: Tag[]): Promise<void> => {
  await writeData(TAGS_FILE, tags);
};

export const getAllTags = async (): Promise<Tag[]> => {
  return await readTags();
};

export const getTagById = async (id: string): Promise<Tag | undefined> => {
  const tags = await readTags();
  return tags.find((tag) => tag.id === id);
};

export const createTag = async (tagData: CreateTagDto): Promise<Tag> => {
  const tags = await readTags();
  const newTag: Tag = {
    id: uuidv4(),
    ...tagData,
  };
  tags.push(newTag);
  await writeTags(tags);
  return newTag;
};

export const updateTag = async (
  id: string,
  tagData: UpdateTagDto
): Promise<Tag | undefined> => {
  const tags = await readTags();
  const tagIndex = tags.findIndex((tag) => tag.id === id);

  if (tagIndex === -1) return undefined;

  const updatedTag = {
    ...tags[tagIndex],
    ...tagData,
  };

  tags[tagIndex] = updatedTag;
  await writeTags(tags);
  return updatedTag;
};

export const deleteTag = async (id: string): Promise<boolean> => {
  const tags = await readTags();
  const initialLength = tags.length;
  const filteredTags = tags.filter((tag) => tag.id !== id);

  if (filteredTags.length === initialLength) return false;

  await writeTags(filteredTags);
  return true;
};
