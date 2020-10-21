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
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const merge_1 = require("./merge");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = core.getInput("GITHUB_TOKEN", { required: true });
            const { GITHUB_REPOSITORY_OWNER: repositoryOwner = "", GITHUB_REPOSITORY = "" } = process.env;
            const octokit = github.getOctokit(token);
            const { payload } = github.context;
            const repositoryName = GITHUB_REPOSITORY.replace(`${repositoryOwner}/`, "");
            if (!Number.isInteger(payload === null || payload === void 0 ? void 0 : payload.number)) {
                throw new Error("Pull request number is required");
            }
            const prInfo = {
                octokit,
                owner: repositoryOwner,
                repo: repositoryName,
                pull_number: payload === null || payload === void 0 ? void 0 : payload.number,
                event: "APPROVE",
                body: "Github Actions loves this Backport",
            };
            yield merge_1.approvePullRequest(prInfo);
            yield merge_1.tryMerge(prInfo);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
