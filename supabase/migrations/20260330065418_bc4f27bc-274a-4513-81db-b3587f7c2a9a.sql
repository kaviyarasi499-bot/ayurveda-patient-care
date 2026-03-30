
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  height NUMERIC NOT NULL,
  weight NUMERIC NOT NULL,
  dosha TEXT NOT NULL CHECK (dosha IN ('Vata', 'Pitta', 'Kapha')),
  health_issue TEXT DEFAULT '',
  bmi NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all patients"
  ON public.patients FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Customers can view own patients"
  ON public.patients FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND NOT public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own patients"
  ON public.patients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any patient"
  ON public.patients FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Customers can update own patients"
  ON public.patients FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND NOT public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any patient"
  ON public.patients FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Customers can delete own patients"
  ON public.patients FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND NOT public.has_role(auth.uid(), 'admin'));

-- Create diet_plans table
CREATE TABLE public.diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  breakfast TEXT NOT NULL,
  lunch TEXT NOT NULL,
  dinner TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view diet plans for accessible patients"
  ON public.diet_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = diet_plans.patient_id
      AND (public.has_role(auth.uid(), 'admin') OR p.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert diet plans for accessible patients"
  ON public.diet_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = diet_plans.patient_id
      AND (public.has_role(auth.uid(), 'admin') OR p.user_id = auth.uid())
    )
  );

-- Create progress_records table
CREATE TABLE public.progress_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  weight NUMERIC NOT NULL,
  remarks TEXT DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE public.progress_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view progress for accessible patients"
  ON public.progress_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = progress_records.patient_id
      AND (public.has_role(auth.uid(), 'admin') OR p.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert progress for accessible patients"
  ON public.progress_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = progress_records.patient_id
      AND (public.has_role(auth.uid(), 'admin') OR p.user_id = auth.uid())
    )
  );

-- Generate patient_id sequence function
CREATE OR REPLACE FUNCTION public.generate_patient_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(patient_id FROM 5) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.patients;
  
  NEW.patient_id := 'AYR-' || LPAD(next_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_patient_id
  BEFORE INSERT ON public.patients
  FOR EACH ROW
  WHEN (NEW.patient_id IS NULL OR NEW.patient_id = '')
  EXECUTE FUNCTION public.generate_patient_id();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
