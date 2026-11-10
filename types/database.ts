export type AgeGroup = "1-3" | "3-6";

export type SubscriptionStatus = "free" | "pro";

export type PlanType = "monthly" | "yearly";

export type PaymentStatus = "pending" | "approved" | "rejected";

export type ChildProfile = {
  id: string;
  parent_user_id: string;
  nickname: string;
  avatar_id: string | null;
  age_group: AgeGroup | null;
  onboarding_completed: boolean;
  stars: number;
  unlocked_trophies: string[];
  unlocked_badges: string[];
  unlocked_toys: string[];
  created_at: string;
};

export type Profile = {
  id: string;
  parent_email: string | null;
  child_nickname: string | null;
  target_age_group: AgeGroup | null;
  avatar_id: string | null;
  subscription_status: SubscriptionStatus;
  subscription_expires_at: string | null;
  is_admin: boolean;
  family_pack: boolean;
  tos_accepted_at: string | null;
  stars: number;
  unlocked_trophies: string[];
  unlocked_badges: string[];
  unlocked_toys: string[];
  reduce_motion: boolean;
  created_at: string;
  updated_at: string;
};

export type Coupon = {
  id: string;
  code: string;
  discount_percent: number;
  plan_type: PlanType | "both";
  expires_at: string | null;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
};

export type PaymentRequest = {
  id: string;
  user_id: string;
  status: PaymentStatus;
  payment_method: string;
  plan_type: PlanType;
  amount: number | null;
  currency: string | null;
  receipt_path: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  profiles?: Pick<Profile, "parent_email" | "child_nickname">;
};

export type AnalyticsSummary = {
  totalUsers: number;
  freeUsers: number;
  proUsers: number;
  ageDistribution: { ageGroup: string; count: number }[];
  signUpGrowth: { date: string; count: number }[];
};
