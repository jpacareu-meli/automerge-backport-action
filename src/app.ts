import * as core from "@actions/core";
import * as github from "@actions/github";
import { tryMerge, approvePullRequest } from "./merge";

async function run() {
  try {
    const token = core.getInput("GITHUB_TOKEN", { required: true });
    const { GITHUB_REPOSITORY_OWNER: repositoryOwner = "", GITHUB_REPOSITORY = "" } = process.env;

    const octokit = github.getOctokit(token);

    const { payload }: any = github.context;
    const repositoryName = GITHUB_REPOSITORY.replace(`${repositoryOwner}/`, "");

    if (!Number.isInteger(payload?.number)) {
      throw new Error("Pull request number is required");
    }

    const prInfo = {
      owner: repositoryOwner,
      repo: repositoryName,
      pull_number: payload?.number,
      event: "APPROVE",
      body: "Github Actions loves this Backport",
    };

    await approvePullRequest(prInfo);
    await tryMerge(prInfo);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
