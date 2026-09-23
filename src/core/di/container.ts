import "server-only";
import { BackendClient } from "@/core/http/backend-client";
import { HttpCompanyRepository } from "@/features/company/infrastructure/http-company-repository";
import { HttpOnboardingRepository } from "@/features/onboarding/infrastructure/http-onboarding-repository";
import { HttpAuthRepository } from "@/features/auth/infrastructure/http-auth-repository";
import { HttpTeamRepository } from "@/features/team/infrastructure/http-team-repository";
import { HttpProfileRepository } from "@/features/profile/infrastructure/http-profile-repository";
import { HttpSettingsRepository } from "@/features/settings/infrastructure/http-settings-repository";
import { HttpDepartmentRepository } from "@/features/departments/infrastructure/http-department-repository";
import { HttpJobPositionRepository } from "@/features/job-positions/infrastructure/http-job-position-repository";
import { HttpTemplateRepository } from "@/features/templates/infrastructure/http-template-repository";
import { HttpQuestionRepository } from "@/features/questions/infrastructure/http-question-repository";
import { HttpFavoriteListRepository } from "@/features/favorite-lists/infrastructure/http-favorite-list-repository";
import { HttpEvaluationCycleRepository } from "@/features/evaluation-cycles/infrastructure/http-evaluation-cycle-repository";
import { HttpEvaluationSubmissionRepository } from "@/features/evaluation-submissions/infrastructure/http-evaluation-submission-repository";
import { HttpDashboardRepository } from "@/features/dashboard/infrastructure/http-dashboard-repository";
import { HttpEvaluationComparisonRepository } from "@/features/evaluation-comparisons/infrastructure/http-evaluation-comparison-repository";
import { GetCompanyByName } from "@/features/company/application/get-company-by-name";
import { GetCompanyByIdentificationId } from "@/features/company/application/get-company-by-identification-id";
import { UpdateCompany } from "@/features/company/application/update-company";
import { DeleteCompany } from "@/features/company/application/delete-company";
import { RegisterOwner } from "@/features/onboarding/application/register-owner";
import { LoginUser } from "@/features/auth/application/login-user";
import { GetMyFeatures } from "@/features/auth/application/get-my-features";
import { VerifyEmail } from "@/features/auth/application/verify-email";
import { Verify2FA } from "@/features/auth/application/verify-2fa";
import { Resend2FA } from "@/features/auth/application/resend-2fa";
import { ResendVerification } from "@/features/auth/application/resend-verification";
import { ForgotPassword } from "@/features/auth/application/forgot-password";
import { ResetPassword } from "@/features/auth/application/reset-password";
import { InviteEmployee } from "@/features/team/application/invite-employee";
import { AssignDepartment } from "@/features/team/application/assign-department";
import { AssignSuperior } from "@/features/team/application/assign-superior";
import { AssignJobPosition } from "@/features/team/application/assign-job-position";
import { GetSubordinates } from "@/features/team/application/get-subordinates";
import { ToggleUserStatus } from "@/features/team/application/toggle-user-status";
import { AcceptInvite } from "@/features/team/application/accept-invite";
import { GetEmployees } from "@/features/team/application/get-employees";
import { GetMyProfile } from "@/features/profile/application/get-my-profile";
import { UpdateProfile } from "@/features/profile/application/update-profile";
import { ChangePassword } from "@/features/profile/application/change-password";
import { Toggle2FA } from "@/features/settings/application/toggle-2fa";
import { CreateDepartment } from "@/features/departments/application/create-department";
import { GetDepartment } from "@/features/departments/application/get-department";
import { ListDepartments } from "@/features/departments/application/list-departments";
import { CreateJobPosition } from "@/features/job-positions/application/create-job-position";
import { UpdateJobPosition } from "@/features/job-positions/application/update-job-position";
import { DeleteJobPosition } from "@/features/job-positions/application/delete-job-position";
import { ListJobPositions } from "@/features/job-positions/application/list-job-positions";
import { CreateTemplate } from "@/features/templates/application/create-template";
import { UpdateTemplate } from "@/features/templates/application/update-template";
import { DeleteTemplate } from "@/features/templates/application/delete-template";
import { GetTemplateById } from "@/features/templates/application/get-template-by-id";
import { ListTemplates } from "@/features/templates/application/list-templates";
import { CreateQuestion } from "@/features/questions/application/create-question";
import { UpdateQuestion } from "@/features/questions/application/update-question";
import { DeleteQuestion } from "@/features/questions/application/delete-question";
import { GetQuestionsByTemplate } from "@/features/questions/application/get-questions-by-template";
import { CreateFavoriteList } from "@/features/favorite-lists/application/create-favorite-list";
import { UpdateFavoriteList } from "@/features/favorite-lists/application/update-favorite-list";
import { DeleteFavoriteList } from "@/features/favorite-lists/application/delete-favorite-list";
import { GetMyFavoriteLists } from "@/features/favorite-lists/application/get-my-favorite-lists";
import { ToggleTemplateInList } from "@/features/favorite-lists/application/toggle-template-in-list";
import { CreateEvaluationCycle } from "@/features/evaluation-cycles/application/create-evaluation-cycle";
import { UpdateEvaluationCycle } from "@/features/evaluation-cycles/application/update-evaluation-cycle";
import { DeleteEvaluationCycle } from "@/features/evaluation-cycles/application/delete-evaluation-cycle";
import { GetAllEvaluationCycles } from "@/features/evaluation-cycles/application/get-all-evaluation-cycles";
import { ToggleTemplateInCycle } from "@/features/evaluation-cycles/application/toggle-template-in-cycle";
import { GenerateSubmissions } from "@/features/evaluation-cycles/application/generate-submissions";
import { GetMyPendingSubmissions } from "@/features/evaluation-submissions/application/get-my-pending-submissions";
import { GetMyCompletedSubmissions } from "@/features/evaluation-submissions/application/get-my-completed-submissions";
import { GetSubmissionById } from "@/features/evaluation-submissions/application/get-submission-by-id";
import { SaveSubmissionAnswers } from "@/features/evaluation-submissions/application/save-submission-answers";
import { GetCycleSubmissions } from "@/features/evaluation-submissions/application/get-cycle-submissions";
import { DeleteSubmission } from "@/features/evaluation-submissions/application/delete-submission";
import { GetDashboardStats } from "@/features/dashboard/application/get-dashboard-stats";
import { GetCycleComparisons } from "@/features/evaluation-comparisons/application/get-cycle-comparisons";

/**
 * Composition root — wires the concrete infrastructure into the use cases.
 * Route handlers depend only on this, keeping the dependency direction
 * pointing inward (presentation → application → domain).
 */
const backendClient = new BackendClient();

const companyRepository = new HttpCompanyRepository(backendClient);
const onboardingRepository = new HttpOnboardingRepository(backendClient);
const authRepository = new HttpAuthRepository(backendClient);
const teamRepository = new HttpTeamRepository(backendClient);
const profileRepository = new HttpProfileRepository(backendClient);
const settingsRepository = new HttpSettingsRepository(backendClient);
const departmentRepository = new HttpDepartmentRepository(backendClient);
const jobPositionRepository = new HttpJobPositionRepository(backendClient);
const templateRepository = new HttpTemplateRepository(backendClient);
const questionRepository = new HttpQuestionRepository(backendClient);
const favoriteListRepository = new HttpFavoriteListRepository(backendClient);
const evaluationCycleRepository = new HttpEvaluationCycleRepository(backendClient);
const evaluationSubmissionRepository = new HttpEvaluationSubmissionRepository(backendClient);
const dashboardRepository = new HttpDashboardRepository(backendClient);
const evaluationComparisonRepository = new HttpEvaluationComparisonRepository(backendClient);

export const useCases = {
  getCompanyByName: new GetCompanyByName(companyRepository),
  getCompanyByIdentificationId: new GetCompanyByIdentificationId(
    companyRepository,
  ),
  updateCompany: new UpdateCompany(companyRepository),
  deleteCompany: new DeleteCompany(companyRepository),
  registerOwner: new RegisterOwner(onboardingRepository),
  loginUser: new LoginUser(authRepository),
  getMyFeatures: new GetMyFeatures(authRepository),
  verifyEmail: new VerifyEmail(authRepository),
  verify2FA: new Verify2FA(authRepository),
  resend2FA: new Resend2FA(authRepository),
  resendVerification: new ResendVerification(authRepository),
  forgotPassword: new ForgotPassword(authRepository),
  resetPassword: new ResetPassword(authRepository),
  inviteEmployee: new InviteEmployee(teamRepository),
  assignDepartment: new AssignDepartment(teamRepository),
  assignSuperior: new AssignSuperior(teamRepository),
  assignJobPosition: new AssignJobPosition(teamRepository),
  getSubordinates: new GetSubordinates(teamRepository),
  toggleUserStatus: new ToggleUserStatus(teamRepository),
  acceptInvite: new AcceptInvite(teamRepository),
  getEmployees: new GetEmployees(teamRepository),
  getMyProfile: new GetMyProfile(profileRepository),
  updateProfile: new UpdateProfile(profileRepository),
  changePassword: new ChangePassword(profileRepository),
  toggle2FA: new Toggle2FA(settingsRepository),
  createDepartment: new CreateDepartment(departmentRepository),
  getDepartment: new GetDepartment(departmentRepository),
  listDepartments: new ListDepartments(departmentRepository),
  createJobPosition: new CreateJobPosition(jobPositionRepository),
  updateJobPosition: new UpdateJobPosition(jobPositionRepository),
  deleteJobPosition: new DeleteJobPosition(jobPositionRepository),
  listJobPositions: new ListJobPositions(jobPositionRepository),
  createTemplate: new CreateTemplate(templateRepository),
  updateTemplate: new UpdateTemplate(templateRepository),
  deleteTemplate: new DeleteTemplate(templateRepository),
  getTemplateById: new GetTemplateById(templateRepository),
  listTemplates: new ListTemplates(templateRepository),
  createQuestion: new CreateQuestion(questionRepository),
  updateQuestion: new UpdateQuestion(questionRepository),
  deleteQuestion: new DeleteQuestion(questionRepository),
  getQuestionsByTemplate: new GetQuestionsByTemplate(questionRepository),
  createFavoriteList: new CreateFavoriteList(favoriteListRepository),
  updateFavoriteList: new UpdateFavoriteList(favoriteListRepository),
  deleteFavoriteList: new DeleteFavoriteList(favoriteListRepository),
  getMyFavoriteLists: new GetMyFavoriteLists(favoriteListRepository),
  toggleTemplateInList: new ToggleTemplateInList(favoriteListRepository),
  createEvaluationCycle: new CreateEvaluationCycle(evaluationCycleRepository),
  updateEvaluationCycle: new UpdateEvaluationCycle(evaluationCycleRepository),
  deleteEvaluationCycle: new DeleteEvaluationCycle(evaluationCycleRepository),
  getAllEvaluationCycles: new GetAllEvaluationCycles(evaluationCycleRepository),
  toggleTemplateInCycle: new ToggleTemplateInCycle(evaluationCycleRepository),
  generateSubmissions: new GenerateSubmissions(evaluationCycleRepository),
  getMyPendingSubmissions: new GetMyPendingSubmissions(evaluationSubmissionRepository),
  getMyCompletedSubmissions: new GetMyCompletedSubmissions(evaluationSubmissionRepository),
  getSubmissionById: new GetSubmissionById(evaluationSubmissionRepository),
  saveSubmissionAnswers: new SaveSubmissionAnswers(evaluationSubmissionRepository),
  getCycleSubmissions: new GetCycleSubmissions(evaluationSubmissionRepository),
  deleteSubmission: new DeleteSubmission(evaluationSubmissionRepository),
  getDashboardStats: new GetDashboardStats(dashboardRepository),
  getCycleComparisons: new GetCycleComparisons(evaluationComparisonRepository),
};
