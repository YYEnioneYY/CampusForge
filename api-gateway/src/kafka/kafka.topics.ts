export const KafkaTopics = {
  Auth: {
    Register: 'auth.register',
    Login: 'auth.login',
    Refresh: 'auth.refresh',

    Logout: 'auth.logout',
    LogoutAll: 'auth.logout-all',
    LogoutSession: 'auth.logout-session',
    Sessions: 'auth.sessions',

    VerifyEmail: 'auth.verify-email',
    ResendEmailVerification: 'auth.resend-email-verification',
  },

  Users: {
    Me: 'users.me',
  },
} as const;

export const KafkaRequestResponseTopics = [
  KafkaTopics.Auth.Register,
  KafkaTopics.Auth.Login,
  KafkaTopics.Auth.Refresh,

  KafkaTopics.Auth.Logout,
  KafkaTopics.Auth.LogoutAll,
  KafkaTopics.Auth.LogoutSession,
  KafkaTopics.Auth.Sessions,

  KafkaTopics.Auth.VerifyEmail,
  KafkaTopics.Auth.ResendEmailVerification,

  KafkaTopics.Users.Me,
] as const;