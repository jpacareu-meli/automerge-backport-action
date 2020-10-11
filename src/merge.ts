import * as core from "@actions/core";

const mergeRetries = 5;
const mergeRetrySleep = 60000;

const retry = async (retries: number, retrySleep: number, doInitial: any, doRetry: any, doFailed: any) => {
  const initialResult = await doInitial();
  if (initialResult === "success") {
    return true;
  } else if (initialResult === "failure") {
    return false;
  } else if (initialResult !== "retry") {
    throw new Error(`invalid return value: ${initialResult}`);
  }

  for (let run = 1; run <= retries; run++) {
    if (retrySleep === 0) {
      console.log(`Retrying ... (${run}/${retries})`);
    } else {
      console.log(`Retrying after ${retrySleep} ms ... (${run}/${retries})`);
      await sleep(retrySleep);
    }

    const retryResult = await doRetry();
    if (retryResult === "success") {
      return true;
    } else if (retryResult === "failure") {
      return false;
    } else if (retryResult !== "retry") {
      throw new Error(`invalid return value: ${initialResult}`);
    }
  }

  await doFailed();
  return false;
};

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const getPullRequest = async ({ octokit, owner, repo, pull_number }: any) => {
  const { data: pr } = await octokit.pulls.get({
    owner,
    repo,
    pull_number,
  });
  return pr;
};

const mergePullRequest = async ({ octokit, owner, repo, pull_number, merge_method }: any) => {
  try {
    await octokit.pulls.merge({
      owner,
      repo,
      pull_number,
      merge_method,
    });
    return "success";
  } catch ({ message }) {
    core.setFailed(message);
    return "failed";
  }
};

export const tryMerge = ({ octokit, owner, repo, pull_number, merge_method }: any) => {
  return retry(
    mergeRetries,
    mergeRetrySleep,
    () => mergePullRequest({ octokit, owner, repo, pull_number, merge_method }),
    async () => {
      const pr = await getPullRequest({ octokit, owner, repo, pull_number });
      if (pr.merged === true) {
        return "success";
      }
      return mergePullRequest({ octokit, owner, repo, pull_number, merge_method });
    },
    () => core.setFailed(`PR could not be merged after ${mergeRetries} tries`)
  );
};

export const approvePullRequest = async ({ octokit, owner, repo, pull_number, body }: any) => {
  try {
    await octokit.pulls.createReview({
      owner,
      repo,
      pull_number,
      body,
      event: "APPROVE",
    });
  } catch ({ message }) {
    core.setFailed(message);
    return "failed";
  }
};
