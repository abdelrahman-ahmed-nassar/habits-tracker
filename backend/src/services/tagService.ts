import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Tag, CreateTagDto, UpdateTagDto } from "../types/tag";

const TAGS_FILE = path.join(__dirname, "../../data/tags.json");

// Helper function to read tags
const readTags = (): Tag[] => {
  try {
    const data = fs.readFileSync(TAGS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Helper function to write tags
const writeTags = (tags: Tag[]): void => {
  fs.writeFileSync(TAGS_FILE, JSON.stringify(tags, null, 2));
};

export const getAllTags = (): Tag[] => {
  return readTags();
};

export const getTagById = (id: string): Tag | undefined => {
  const tags = readTags();
  return tags.find((tag) => tag.id === id);
};

export const createTag = (tagData: CreateTagDto): Tag => {
  const tags = readTags();
  const newTag: Tag = {
    id: uuidv4(),
    ...tagData,
  };
  tags.push(newTag);
  writeTags(tags);
  return newTag;
};

export const updateTag = (
  id: string,
  tagData: UpdateTagDto
): Tag | undefined => {
  const tags = readTags();
  const tagIndex = tags.findIndex((tag) => tag.id === id);

  if (tagIndex === -1) return undefined;

  const updatedTag = {
    ...tags[tagIndex],
    ...tagData,
  };

  tags[tagIndex] = updatedTag;
  writeTags(tags);
  return updatedTag;
};

export const deleteTag = (id: string): boolean => {
  const tags = readTags();
  const initialLength = tags.length;
  const filteredTags = tags.filter((tag) => tag.id !== id);

  if (filteredTags.length === initialLength) return false;

  writeTags(filteredTags);
  return true;
};
