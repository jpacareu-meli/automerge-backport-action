"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approvePullRequest = exports.tryMerge = void 0;
const core = __importStar(require("@actions/core"));
const mergeRetries = 5;
const mergeRetrySleep = 60000;
const retry = (retries, retrySleep, doInitial, doRetry, doFailed) => __awaiter(void 0, void 0, void 0, function* () {
    const initialResult = yield doInitial();
    if (initialResult === "success") {
        return true;
    }
    else if (initialResult === "failure") {
        return false;
    }
    else if (initialResult !== "retry") {
        throw new Error(`invalid return value: ${initialResult}`);
    }
    for (let run = 1; run <= retries; run++) {
        if (retrySleep === 0) {
            console.log(`Retrying ... (${run}/${retries})`);
        }
        else {
            console.log(`Retrying after ${retrySleep} ms ... (${run}/${retries})`);
            yield sleep(retrySleep);
        }
        const retryResult = yield doRetry();
        if (retryResult === "success") {
            return true;
        }
        else if (retryResult === "failure") {
            return false;
        }
        else if (retryResult !== "retry") {
            throw new Error(`invalid return value: ${initialResult}`);
        }
    }
    yield doFailed();
    return false;
});
const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
const getPullRequest = ({ octokit, owner, repo, pull_number }) => __awaiter(void 0, void 0, void 0, function* () {
    const { data: pr } = yield octokit.pulls.get({
        owner,
        repo,
        pull_number,
    });
    return pr;
});
const mergePullRequest = ({ octokit, owner, repo, pull_number, merge_method }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield octokit.pulls.merge({
            owner,
            repo,
            pull_number,
            merge_method,
        });
        return "success";
    }
    catch ({ message }) {
        core.setFailed(message);
        return "failed";
    }
});
exports.tryMerge = ({ octokit, owner, repo, pull_number, merge_method }) => {
    return retry(mergeRetries, mergeRetrySleep, () => mergePullRequest({ octokit, owner, repo, pull_number, merge_method }), () => __awaiter(void 0, void 0, void 0, function* () {
        const pr = yield getPullRequest({ octokit, owner, repo, pull_number });
        if (pr.merged === true) {
            return "success";
        }
        return mergePullRequest({ octokit, owner, repo, pull_number, merge_method });
    }), () => core.setFailed(`PR could not be merged after ${mergeRetries} tries`));
};
exports.approvePullRequest = ({ octokit, owner, repo, pull_number, body }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield octokit.pulls.createReview({
            owner,
            repo,
            pull_number,
            body,
            event: "APPROVE",
        });
    }
    catch ({ message }) {
        core.setFailed(message);
        return "failed";
    }
});
