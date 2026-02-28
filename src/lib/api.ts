const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export type ApiError = {
  message: string;
  status?: number;
};

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
};

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw {
      message: payload?.message || "Request failed",
      status: response.status,
    } as ApiError;
  }

  return payload as T;
}

export type ApiUserRole = "super_admin" | "admin" | "teacher" | "student";

export type LoginResponse = {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: ApiUserRole;
  };
};

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function logoutRequest(token: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/logout", {
    method: "POST",
    token,
  });
}

export async function forgotPasswordRequest(email: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export type PaginatedResponse<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type ApiClass = {
  id: number;
  name: string;
  students_count?: number;
  subjects_count?: number;
};

export type ApiStudent = {
  id: number;
  student_id: string;
  class_id: number;
  status: string;
  photo_path: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    role: ApiUserRole;
  };
  school_class?: {
    id: number;
    name: string;
  };
};

export type ApiSubject = {
  id: number;
  name: string;
  class_id: number;
  teacher_id: number;
  school_class?: {
    id: number;
    name: string;
  };
};

export async function fetchStudents(token: string): Promise<PaginatedResponse<ApiStudent>> {
  return apiRequest<PaginatedResponse<ApiStudent>>("/students?per_page=200", { token });
}

export async function createStudent(
  token: string,
  payload: { name: string; email: string; password: string; class_id: number; student_id: string; status?: string }
): Promise<ApiStudent> {
  return apiRequest<ApiStudent>("/students", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function updateStudent(
  token: string,
  id: number,
  payload: Partial<{ name: string; email: string; class_id: number; student_id: string; status: string }>
): Promise<ApiStudent> {
  return apiRequest<ApiStudent>(`/students/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });
}

export async function deleteStudent(token: string, id: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/students/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function fetchClasses(token: string): Promise<PaginatedResponse<ApiClass>> {
  return apiRequest<PaginatedResponse<ApiClass>>("/classes?per_page=200", { token });
}

export async function createClass(token: string, payload: { name: string }): Promise<ApiClass> {
  return apiRequest<ApiClass>("/classes", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function updateClass(token: string, id: number, payload: { name: string }): Promise<ApiClass> {
  return apiRequest<ApiClass>(`/classes/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });
}

export async function deleteClass(token: string, id: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/classes/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function fetchSubjects(token: string): Promise<PaginatedResponse<ApiSubject>> {
  return apiRequest<PaginatedResponse<ApiSubject>>("/subjects?per_page=300", { token });
}

export async function createSubject(
  token: string,
  payload: { name: string; class_id: number; teacher_id: number }
): Promise<ApiSubject> {
  return apiRequest<ApiSubject>("/subjects", {
    method: "POST",
    token,
    body: payload,
  });
}

export type ApiQuestionType = "mcq" | "true_false" | "essay";

export type ApiQuestion = {
  id: number;
  subject_id: number;
  class_id: number;
  type: ApiQuestionType;
  question_text: string;
  correct_answer: string | null;
  marks: number;
  subject?: {
    id: number;
    name: string;
  };
  school_class?: {
    id: number;
    name: string;
  };
};

export async function fetchQuestions(token: string): Promise<PaginatedResponse<ApiQuestion>> {
  return apiRequest<PaginatedResponse<ApiQuestion>>("/questions?per_page=300", { token });
}

export async function createQuestion(
  token: string,
  payload: {
    subject_id: number;
    class_id: number;
    type: ApiQuestionType;
    question_text: string;
    correct_answer?: string | null;
    marks: number;
  }
): Promise<ApiQuestion> {
  return apiRequest<ApiQuestion>("/questions", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function updateQuestion(
  token: string,
  id: number,
  payload: Partial<{
    subject_id: number;
    class_id: number;
    type: ApiQuestionType;
    question_text: string;
    correct_answer: string | null;
    marks: number;
  }>
): Promise<ApiQuestion> {
  return apiRequest<ApiQuestion>(`/questions/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });
}

export async function deleteQuestion(token: string, id: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/questions/${id}`, {
    method: "DELETE",
    token,
  });
}

export type ApiTerm = {
  id: number;
  name: string;
  academic_year_id: number;
  is_active: boolean;
  academic_year?: {
    id: number;
    name: string;
    is_active: boolean;
  };
};

export type ApiExamStatus = "draft" | "active" | "closed";

export type ApiExam = {
  id: number;
  class_id: number;
  subject_id: number;
  term_id: number;
  duration_minutes: number;
  total_marks: number;
  status: ApiExamStatus;
  exam_date: string;
  school_class?: { id: number; name: string };
  subject?: { id: number; name: string };
  term?: { id: number; name: string; academic_year?: { id: number; name: string } };
  questions?: { id: number }[];
};

export type ApiResult = {
  id: number;
  student_id: number;
  class_id: number;
  term_id: number;
  total_marks: number;
  average: number;
  position: number | null;
  grade: string;
  student?: {
    id: number;
    user?: { id: number; name: string; email: string };
  };
  school_class?: { id: number; name: string };
  term?: { id: number; name: string };
};

export async function fetchTerms(token: string): Promise<PaginatedResponse<ApiTerm>> {
  return apiRequest<PaginatedResponse<ApiTerm>>("/terms?per_page=100", { token });
}

export async function fetchExams(token: string): Promise<PaginatedResponse<ApiExam>> {
  return apiRequest<PaginatedResponse<ApiExam>>("/exams?per_page=300", { token });
}

export async function createExam(
  token: string,
  payload: {
    class_id: number;
    subject_id: number;
    term_id: number;
    duration_minutes: number;
    total_marks: number;
    status: ApiExamStatus;
    exam_date: string;
  }
): Promise<ApiExam> {
  return apiRequest<ApiExam>("/exams", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function updateExam(
  token: string,
  id: number,
  payload: Partial<{
    class_id: number;
    subject_id: number;
    term_id: number;
    duration_minutes: number;
    total_marks: number;
    status: ApiExamStatus;
    exam_date: string;
  }>
): Promise<ApiExam> {
  return apiRequest<ApiExam>(`/exams/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });
}

export async function deleteExam(token: string, id: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/exams/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function generateResults(
  token: string,
  payload: { class_id: number; term_id: number }
): Promise<ApiResult[]> {
  return apiRequest<ApiResult[]>("/results/generate", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function fetchClassResults(token: string, classId: number): Promise<ApiResult[]> {
  return apiRequest<ApiResult[]>(`/results/class/${classId}`, { token });
}

export async function fetchTopStudents(
  token: string,
  classId: number,
  limit = 10
): Promise<Array<{ student?: { user?: { name: string } }; average: number; total_marks: number }>> {
  return apiRequest(`/reports/top-students?class_id=${classId}&limit=${limit}`, { token });
}

export async function fetchFailedStudents(
  token: string,
  classId: number,
  passMark = 50
): Promise<Array<{ student?: { user?: { name: string } }; average: number }>> {
  return apiRequest(`/reports/failed?class_id=${classId}&pass_mark=${passMark}`, { token });
}

export async function fetchPerformanceReport(
  token: string,
  classId: number,
  termId: number
): Promise<{
  grade_distribution: Array<{ grade: string; total: number }>;
  subject_performance: Array<{ id: number; name: string; avg_score: number }>;
  class_average_per_subject: Array<{ id: number; name: string; avg_score: number }>;
}> {
  return apiRequest(`/reports/performance?class_id=${classId}&term_id=${termId}`, { token });
}

export async function exportBackup(token: string): Promise<{ message: string; path: string }> {
  return apiRequest<{ message: string; path: string }>("/backup/export", {
    method: "POST",
    token,
  });
}

export async function restoreBackup(token: string, file: File): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/backup/restore`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw {
      message: payload?.message || "Request failed",
      status: response.status,
    } as ApiError;
  }

  return payload as { message: string };
}

export type ApiTeacher = {
  id: number;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email: string;
    role: ApiUserRole;
  };
  subjects?: Array<{
    id: number;
    name: string;
    class_id: number;
    school_class?: { id: number; name: string };
  }>;
};

export type ApiSchoolSetting = {
  id: number;
  school_name: string;
  address: string | null;
  contact: string | null;
  class_score_weight: number;
  exam_score_weight: number;
  current_academic_year: string | null;
  current_term: string | null;
  logo_path: string | null;
  image_path: string | null;
};

export type ApiGradingScale = {
  id: number;
  min_score: number;
  max_score: number;
  grade_letter: string;
  remark: string;
};

export async function createStudentWithPhoto(
  token: string,
  payload: { name: string; email: string; password: string; class_id: number; student_id: string; status?: string },
  photoFile?: File | null
): Promise<ApiStudent> {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("email", payload.email);
  formData.append("password", payload.password);
  formData.append("class_id", String(payload.class_id));
  formData.append("student_id", payload.student_id);
  if (payload.status) formData.append("status", payload.status);
  if (photoFile) formData.append("photo", photoFile);

  const response = await fetch(`${API_BASE_URL}/students`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw {
      message: result?.message || "Request failed",
      status: response.status,
    } as ApiError;
  }

  return result as ApiStudent;
}

export async function updateStudentWithPhoto(
  token: string,
  id: number,
  payload: Partial<{ name: string; email: string; class_id: number; student_id: string; status: string }>,
  photoFile?: File | null
): Promise<ApiStudent> {
  const formData = new FormData();
  formData.append("_method", "PUT");
  if (payload.name !== undefined) formData.append("name", payload.name);
  if (payload.email !== undefined) formData.append("email", payload.email);
  if (payload.class_id !== undefined) formData.append("class_id", String(payload.class_id));
  if (payload.student_id !== undefined) formData.append("student_id", payload.student_id);
  if (payload.status !== undefined) formData.append("status", payload.status);
  if (photoFile) formData.append("photo", photoFile);

  const response = await fetch(`${API_BASE_URL}/students/${id}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw {
      message: result?.message || "Request failed",
      status: response.status,
    } as ApiError;
  }

  return result as ApiStudent;
}

export async function fetchTeachers(token: string): Promise<PaginatedResponse<ApiTeacher>> {
  return apiRequest<PaginatedResponse<ApiTeacher>>("/teachers?per_page=200", { token });
}

export async function createTeacher(
  token: string,
  payload: { name: string; email: string; password: string }
): Promise<ApiTeacher> {
  return apiRequest<ApiTeacher>("/teachers", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function updateTeacher(
  token: string,
  id: number,
  payload: Partial<{ name: string; email: string; password: string }>
): Promise<ApiTeacher> {
  return apiRequest<ApiTeacher>(`/teachers/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });
}

export async function deleteTeacher(token: string, id: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/teachers/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function importQuestions(token: string, file: File): Promise<{ imported: number; errors: Array<{ row: number; message: string }> }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/questions/import`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw {
      message: result?.message || "Request failed",
      status: response.status,
    } as ApiError;
  }

  return result as { imported: number; errors: Array<{ row: number; message: string }> };
}

export async function fetchSchoolSettings(token: string): Promise<ApiSchoolSetting> {
  return apiRequest<ApiSchoolSetting>("/settings", { token });
}

export async function updateSchoolSettings(
  token: string,
  payload: {
    school_name: string;
    address?: string;
    contact?: string;
    class_score_weight: number;
    exam_score_weight: number;
    current_academic_year?: string;
    current_term?: string;
  }
): Promise<ApiSchoolSetting> {
  return apiRequest<ApiSchoolSetting>("/settings", {
    method: "PUT",
    token,
    body: payload,
  });
}

async function uploadSettingsAsset(
  token: string,
  endpoint: "/settings/logo" | "/settings/image",
  fileKey: "logo" | "image",
  file: File
): Promise<{ message: string; logo_path?: string; image_path?: string }> {
  const formData = new FormData();
  formData.append(fileKey, file);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw {
      message: result?.message || "Request failed",
      status: response.status,
    } as ApiError;
  }

  return result as { message: string; logo_path?: string; image_path?: string };
}

export async function uploadSchoolLogo(token: string, file: File): Promise<{ message: string; logo_path?: string }> {
  const result = await uploadSettingsAsset(token, "/settings/logo", "logo", file);
  return { message: result.message, logo_path: result.logo_path };
}

export async function uploadSchoolImage(token: string, file: File): Promise<{ message: string; image_path?: string }> {
  const result = await uploadSettingsAsset(token, "/settings/image", "image", file);
  return { message: result.message, image_path: result.image_path };
}

export async function fetchGradingScales(token: string): Promise<ApiGradingScale[]> {
  return apiRequest<ApiGradingScale[]>("/grading-scales", { token });
}

export async function createGradingScale(
  token: string,
  payload: { min_score: number; max_score: number; grade_letter: string; remark: string }
): Promise<ApiGradingScale> {
  return apiRequest<ApiGradingScale>("/grading-scales", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function saveGradingScale(
  token: string,
  id: number,
  payload: { min_score: number; max_score: number; grade_letter: string; remark: string }
): Promise<ApiGradingScale> {
  return apiRequest<ApiGradingScale>(`/grading-scales/${id}`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export async function removeGradingScale(token: string, id: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/grading-scales/${id}`, {
    method: "DELETE",
    token,
  });
}
