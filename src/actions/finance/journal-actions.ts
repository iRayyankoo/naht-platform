"use server";

import {
  handleCreateDraft,
  handleCreateDraftWithLines,
  handleUpdateDraft,
  handleAddLine,
  handleUpdateLine,
  handleRemoveLine,
  handleSubmitForReview,
  handleReviewJournal,
  handleReturnForModification,
  handleApproveJournal,
  handleVoidJournal,
  handleReverseJournal,
  handlePostJournal,
  handleGetJournal,
  handleListJournals,
} from "./finance-handlers";

export async function createDraftAction(input: unknown) {
  return handleCreateDraft(input);
}

export async function createDraftWithLinesAction(input: unknown) {
  return handleCreateDraftWithLines(input);
}

export async function updateDraftAction(input: unknown) {
  return handleUpdateDraft(input);
}

export async function addLineAction(input: unknown) {
  return handleAddLine(input);
}

export async function updateLineAction(input: unknown) {
  return handleUpdateLine(input);
}

export async function removeLineAction(input: unknown) {
  return handleRemoveLine(input);
}

export async function submitForReviewAction(input: unknown) {
  return handleSubmitForReview(input);
}

export async function reviewJournalAction(input: unknown) {
  return handleReviewJournal(input);
}

export async function returnForModificationAction(input: unknown) {
  return handleReturnForModification(input);
}

export async function approveJournalAction(input: unknown) {
  return handleApproveJournal(input);
}

export async function voidJournalAction(input: unknown) {
  return handleVoidJournal(input);
}

export async function reverseJournalAction(input: unknown) {
  return handleReverseJournal(input);
}

export async function postJournalAction(input: unknown) {
  return handlePostJournal(input);
}

export async function getJournalAction(input: unknown) {
  return handleGetJournal(input);
}

export async function listJournalsAction(input: unknown) {
  return handleListJournals(input);
}
