import { configApi, sessionApi, statsApi } from './api/index.js';
import { http } from './httpClient.js';

let authenticatedPreloadStarted = false;

function warmApi() {
  void http.prefetch('/health');
}

function preloadDashboardData() {
  void statsApi.get();
  void sessionApi.history({ page: 1, pageSize: 20 });
}

function preloadDashboardRoute() {
  void import('../pages/Dashboard/Dashboard.jsx');
}

function preloadPracticeRoute() {
  void import('../pages/PracticeSetup/PracticeSetup.jsx');
}

function preloadConversationRoute() {
  void import('../pages/Conversation/Conversation.jsx');
}

function preloadEvaluationRoute() {
  void import('../pages/Evaluation/Evaluation.jsx');
}

export function preloadAuthenticatedApp() {
  if (authenticatedPreloadStarted) return;
  authenticatedPreloadStarted = true;

  warmApi();
  preloadDashboardRoute();
  preloadPracticeRoute();
  preloadDashboardData();
  void configApi.get();
}

export function resetAuthenticatedPreload() {
  authenticatedPreloadStarted = false;
}

export function preloadPracticeSetup() {
  preloadPracticeRoute();
  void configApi.get();
}

export function preloadConversation(sessionId) {
  if (!sessionId) return;
  preloadConversationRoute();
  void sessionApi.get(sessionId);
}

export function preloadSessionResult(sessionId) {
  if (!sessionId) return;
  preloadEvaluationRoute();
  void sessionApi.get(sessionId);
}

export function preloadDashboard() {
  preloadDashboardRoute();
  preloadDashboardData();
}
