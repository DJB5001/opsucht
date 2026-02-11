-- ============================================
-- DARKNOVA Farm Management - Supabase Schema
-- ============================================

-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('admin', 'farmer', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- ============================================
-- FARM ORDERS TABLE
-- ============================================
CREATE TABLE public.farm_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date DATE NOT NULL,
  deadline DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed')),
  auto_assign BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.farm_orders(id) ON DELETE CASCADE,
  block_id TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  unit TEXT NOT NULL DEFAULT 'dk' CHECK (unit IN ('dk', 'kisten'))
);

-- ============================================
-- USER ORDER PROGRESS TABLE
-- ============================================
CREATE TABLE public.user_order_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.farm_orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('accepted', 'in_progress', 'submitted', 'confirmed')),
  submitted_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(order_id, user_id)
);

-- ============================================
-- COMPLETED ITEMS TABLE
-- ============================================
CREATE TABLE public.completed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  progress_id UUID NOT NULL REFERENCES public.user_order_progress(id) ON DELETE CASCADE,
  block_id TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0 CHECK (amount >= 0),
  UNIQUE(progress_id, block_id)
);

-- ============================================
-- ABSENCE REQUESTS TABLE
-- ============================================
CREATE TABLE public.absence_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_user_order_progress_order_id ON public.user_order_progress(order_id);
CREATE INDEX idx_user_order_progress_user_id ON public.user_order_progress(user_id);
CREATE INDEX idx_completed_items_progress_id ON public.completed_items(progress_id);
CREATE INDEX idx_absence_requests_user_id ON public.absence_requests(user_id);
CREATE INDEX idx_farm_orders_status ON public.farm_orders(status);

-- ============================================
-- HELPER FUNCTION: get current user's role
-- ============================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ============================================
-- TRIGGER: auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'farmer')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile but not role"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "Admins can delete other profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.get_my_role() = 'admin' AND id != auth.uid());

-- FARM ORDERS
ALTER TABLE public.farm_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read orders"
  ON public.farm_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create orders"
  ON public.farm_orders FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "Admins can update orders"
  ON public.farm_orders FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Admins can delete orders"
  ON public.farm_orders FOR DELETE
  TO authenticated
  USING (public.get_my_role() = 'admin');

-- ORDER ITEMS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert order items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "Admins can update order items"
  ON public.order_items FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Admins can delete order items"
  ON public.order_items FOR DELETE
  TO authenticated
  USING (public.get_my_role() = 'admin');

-- USER ORDER PROGRESS
ALTER TABLE public.user_order_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all progress"
  ON public.user_order_progress FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can accept orders for themselves"
  ON public.user_order_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.get_my_role() = 'admin');

CREATE POLICY "Users update own progress or admin updates any"
  ON public.user_order_progress FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR public.get_my_role() = 'admin');

CREATE POLICY "Admins can delete progress"
  ON public.user_order_progress FOR DELETE
  TO authenticated
  USING (public.get_my_role() = 'admin');

-- COMPLETED ITEMS
ALTER TABLE public.completed_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read completed items"
  ON public.completed_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users manage own completed items"
  ON public.completed_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_order_progress
      WHERE id = progress_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users update own completed items"
  ON public.completed_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_order_progress
      WHERE id = progress_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete completed items"
  ON public.completed_items FOR DELETE
  TO authenticated
  USING (public.get_my_role() = 'admin');

-- ABSENCE REQUESTS
ALTER TABLE public.absence_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own absences, admins read all"
  ON public.absence_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.get_my_role() = 'admin');

CREATE POLICY "Users create own absence requests"
  ON public.absence_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update absence requests"
  ON public.absence_requests FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Admins can delete absence requests"
  ON public.absence_requests FOR DELETE
  TO authenticated
  USING (public.get_my_role() = 'admin');
