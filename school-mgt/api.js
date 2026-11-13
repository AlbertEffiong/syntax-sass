/* ============================================================================
   Syntax SaaS — API client (vanilla JS)
   ----------------------------------------------------------------------------
   A dependency-free wrapper around the Syntax SaaS backend REST API.

   It handles:
     • base URL + credentials (cookies)
     • the double-submit CSRF token (reads the `csrfToken` cookie and echoes it
       in the `x-csrf-token` header on state-changing requests)
     • optional Bearer-token auth (for non-cookie environments)
     • the `{ success, data }` / `{ success, error }` response envelope with a
       typed ApiError carrying status / code / details

   Usage (browser):
       <script src="api.js"></script>
       <script>
         SyntaxApi.configure({ baseUrl: 'http://localhost:4000' });
         await SyntaxApi.auth.login('admin', { email, password });
         const classes = await SyntaxApi.admin.listClasses();
       </script>

   The backend must be reachable from the page's origin and the page must be
   served over http(s) on an origin listed in the backend's CORS_ORIGINS.
   ========================================================================== */
(function (global) {
  'use strict';

  var cfg = {
    baseUrl: 'http://localhost:4000',
    // 'cookie' (default, browsers) or 'bearer' (stateless clients).
    authMode: 'cookie',
    credentials: 'include',
    // Optional trace hook: function({ method, path, status, ms, error }).
    onRequest: null,
  };

  var bearerToken = null;

  try {
    if (typeof sessionStorage !== 'undefined') bearerToken = sessionStorage.getItem('syntaxApiToken');
  } catch (e) {}

  function storeToken(token) {
    bearerToken = token || null;
    try {
      if (typeof sessionStorage !== 'undefined') {
        if (bearerToken) sessionStorage.setItem('syntaxApiToken', bearerToken);
        else sessionStorage.removeItem('syntaxApiToken');
      }
    } catch (e) {}
    return token;
  }

  /** Merge user configuration. */
  function configure(options) {
    if (options) {
      for (var k in options) {
        if (Object.prototype.hasOwnProperty.call(options, k)) cfg[k] = options[k];
      }
    }
    return cfg;
  }

  /** Error thrown for any non-2xx / `success:false` response. */
  function ApiError(message, status, code, details) {
    var err = Error.call(this, message);
    this.name = 'ApiError';
    this.message = message;
    this.status = status;
    this.code = code;
    this.details = details;
    this.stack = err.stack;
  }
  ApiError.prototype = Object.create(Error.prototype);
  ApiError.prototype.constructor = ApiError;

  function getCookie(name) {
    if (typeof document === 'undefined') return null;
    var match = document.cookie.match(
      new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'),
    );
    return match ? decodeURIComponent(match[1]) : null;
  }

  function buildQuery(params) {
    if (!params) return '';
    var search = new URLSearchParams();
    Object.keys(params).forEach(function (key) {
      var value = params[key];
      if (value !== undefined && value !== null && value !== '') search.append(key, value);
    });
    var qs = search.toString();
    return qs ? '?' + qs : '';
  }

  /** Core request. Returns `data` from the envelope, or throws ApiError. */
  function request(method, path, body, options) {
    options = options || {};
    var unsafe = ['POST', 'PUT', 'PATCH', 'DELETE'].indexOf(method) !== -1;
    var sessionBootstrapPath = [
      '/api/auth/login',
      '/api/auth/verify-otp',
      '/api/auth/teacher/resend-otp',
      '/api/auth/resend-otp',
      '/api/student/login',
    ].indexOf(path) !== -1;

    if (cfg.authMode === 'bearer' && unsafe && !bearerToken && !sessionBootstrapPath && path !== '/api/auth/me') {
      return request('GET', '/api/auth/me', undefined, { skipBearer: true }).then(function (session) {
        if (!session || !session.token) {
          throw new ApiError('Your session expired. Sign in again before making changes.', 401, 'SESSION_EXPIRED');
        }
        storeToken(session.token);
        return request(method, path, body, options);
      });
    }

    var headers = {};
    if (options.headers) {
      for (var h in options.headers) {
        if (Object.prototype.hasOwnProperty.call(options.headers, h)) headers[h] = options.headers[h];
      }
    }
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    var usingBearer = cfg.authMode === 'bearer' && !!bearerToken && !options.skipBearer;
    if (usingBearer) {
      headers['Authorization'] = 'Bearer ' + bearerToken;
    }
    if (cfg.authMode === 'cookie' && unsafe) {
      var csrf = getCookie('csrfToken');
      if (csrf) headers['x-csrf-token'] = csrf;
    }

    var url = cfg.baseUrl.replace(/\/$/, '') + path;
    var startedAt = Date.now();

    return fetch(url, {
      method: method,
      headers: headers,
      credentials: cfg.credentials,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
      .then(function (res) {
        return res.text().then(function (text) {
          var payload = null;
          if (text) {
            try {
              payload = JSON.parse(text);
            } catch (e) {
              payload = text;
            }
          }
          if (typeof cfg.onRequest === 'function') {
            cfg.onRequest({ method: method, path: path, status: res.status, ms: Date.now() - startedAt });
          }
          if (!res.ok || (payload && payload.success === false)) {
            var info = (payload && payload.error) || {};
            throw new ApiError(
              info.message || 'Request failed (' + res.status + ')',
              res.status,
              info.code,
              info.details,
            );
          }
          return payload ? payload.data : null;
        });
      })
      .catch(function (err) {
        if (err instanceof ApiError) throw err;
        if (typeof cfg.onRequest === 'function') {
          cfg.onRequest({ method: method, path: path, status: 0, ms: Date.now() - startedAt, error: err });
        }
        throw new ApiError('Network error — is the API running and CORS configured?', 0, 'NETWORK', err);
      });
  }

  var get = function (p) {
    return request('GET', p);
  };
  var post = function (p, b) {
    return request('POST', p, b);
  };
  var patch = function (p, b) {
    return request('PATCH', p, b);
  };
  var del = function (p) {
    return request('DELETE', p);
  };

  // ---------------------------------------------------------------- namespaces
  var auth = {
    registerSchool: function (payload) {
      return post('/api/auth/register-school', payload);
    },
    login: function (role, credentials) {
      var body = Object.assign({ role: role }, credentials || {});
      return post('/api/auth/login', body).then(captureToken);
    },
    inviteTeacher: function (payload) {
      return post('/api/auth/invite-teacher', payload);
    },
    verifyOtp: function (payload) {
      return post('/api/auth/verify-otp', payload).then(captureToken);
    },
    // Teacher self-service OTP resend (public; used on teacher login/activation)
    resendTeacherOtp: function (payload) {
      return post('/api/auth/teacher/resend-otp', payload);
    },
    // Backward-compatible alias
    resendOtp: function (payload) {
      return post('/api/auth/teacher/resend-otp', payload);
    },
    me: function () {
      return get('/api/auth/me').then(captureToken);
    },
    logout: function () {
      return post('/api/auth/logout').catch(function () {}).then(function () {
        storeToken(null);
      });
    },
  };

  var owner = {
    dashboard: function () {
      return get('/api/owner/dashboard');
    },
    listSchools: function (params) {
      return get('/api/owner/schools' + buildQuery(params));
    },
    setSchoolStatus: function (id, status) {
      return patch('/api/owner/schools/' + encodeURIComponent(id) + '/status', { status: status });
    },
    extendSubscription: function (id) {
      return post('/api/owner/schools/' + encodeURIComponent(id) + '/extend');
    },
    removeSchool: function (id) {
      return del('/api/owner/schools/' + encodeURIComponent(id));
    },
    getPendingPaymentReceipt: function (schoolId) {
      return get('/api/owner/schools/' + encodeURIComponent(schoolId) + '/pending-payment/receipt');
    },
    verifyPayment: function (payload) {
      return post('/api/owner/verify-payment', payload);
    },
    rejectPayment: function (payload) {
      return post('/api/owner/reject-payment', payload);
    },
  };

  var admin = {
    getSchool: function () {
      return get('/api/admin/school');
    },
    updateProfile: function (payload) {
      return patch('/api/admin/school', payload || {});
    },
    dashboard: function () {
      return get('/api/admin/dashboard');
    },
    updateDebtorControl: function (restrictDebtors) {
      return patch('/api/admin/debtor-control', { restrictDebtors: restrictDebtors });
    },
    updateAcademicSetting: function (payload) {
      return patch('/api/admin/academic-setting', payload);
    },
    createClass: function (payload) {
      return post('/api/admin/classes', payload);
    },
    updateClass: function (id, payload) {
      return patch('/api/admin/classes/' + encodeURIComponent(id), payload);
    },
    listClasses: function () {
      return get('/api/admin/classes');
    },
    enrollStudent: function (payload) {
      return post('/api/admin/students', payload);
    },
    listStudents: function (params) {
      return get('/api/admin/students' + buildQuery(params));
    },
    getStudent: function (id) {
      return get('/api/admin/students/' + encodeURIComponent(id));
    },
    updateStudent: function (id, payload) {
      return patch('/api/admin/students/' + encodeURIComponent(id), payload);
    },
    recordStudentPayment: function (id, amount) {
      return post('/api/admin/students/' + encodeURIComponent(id) + '/payments', { amount: amount });
    },
    listTeachers: function (params) {
      return get('/api/admin/teachers' + buildQuery(params));
    },
    updateTeacher: function (id, payload) {
      return patch('/api/admin/teachers/' + encodeURIComponent(id), payload);
    },
    removeTeacher: function (id) {
      return del('/api/admin/teachers/' + encodeURIComponent(id));
    },
    resendTeacherOtp: function (id) {
      return post('/api/admin/teachers/' + encodeURIComponent(id) + '/resend-otp');
    },
    changeTeacherPassword: function (id, payload) {
      return patch('/api/admin/teachers/' + encodeURIComponent(id) + '/password', payload);
    },
    listAssessments: function (params) {
      return get('/api/admin/pending-assessments' + buildQuery(params));
    },
    getAssessmentDetails: function (id) {
      return get('/api/admin/pending-assessments/' + encodeURIComponent(id));
    },
    reviewAssessment: function (payload) {
      return post('/api/admin/pending-assessments', payload);
    },
    submitBankTransfer: function (payload) {
      return post('/api/admin/subscription/bank-transfer', payload);
    },
    getPendingPaymentReceipt: function () {
      return get('/api/admin/subscription/receipt');
    },
    getSubscription: function () {
      return get('/api/admin/subscription');
    },
    deleteActivity: function (id) {
      return del('/api/admin/activities/' + encodeURIComponent(id));
    },
    clearActivities: function () {
      return del('/api/admin/activities');
    },
  };

  var teacher = {
    context: function () {
      return get('/api/teacher/context');
    },
    classesSubjects: function () {
      return get('/api/teacher/classes-subjects');
    },
    roster: function (classId) {
      return get('/api/teacher/roster' + buildQuery({ classId: classId }));
    },
    getBroadsheet: function (params) {
      return get('/api/teacher/broadsheet' + buildQuery(params));
    },
    saveBroadsheet: function (payload) {
      return post('/api/teacher/broadsheet/save', payload);
    },
    submitBroadsheet: function (payload) {
      return post('/api/teacher/broadsheet/submit', payload);
    },
    notifyAdminSetup: function () {
      return post('/api/teacher/notify-admin-setup', {});
    },
    traits: {
      get: function (studentId, params) {
        return get('/api/teacher/students/' + encodeURIComponent(studentId) + '/traits' + buildQuery(params));
      },
      upsert: function (studentId, payload) {
        return post('/api/teacher/students/' + encodeURIComponent(studentId) + '/traits', payload);
      },
    },
  };

  var student = {
    login: function (credentials) {
      return post('/api/student/login', credentials).then(captureToken);
    },
    results: function (params) {
      return get('/api/student/results' + buildQuery(params));
    },
  };

  function captureToken(data) {
    if (data && data.token) storeToken(data.token);
    return data;
  }

  var api = {
    configure: configure,
    request: request,
    get: get,
    post: post,
    patch: patch,
    delete: del,
    auth: auth,
    owner: owner,
    admin: admin,
    teacher: teacher,
    student: student,
    ApiError: ApiError,
    getToken: function () {
      return bearerToken;
    },
    setToken: function (token) {
      storeToken(token);
    },
    getConfig: function () {
      return Object.assign({}, cfg);
    },
  };

  // Apply any pre-declared global config (e.g. set in index.html).
  if (global.API_CONFIG) configure(global.API_CONFIG);

  global.SyntaxApi = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
