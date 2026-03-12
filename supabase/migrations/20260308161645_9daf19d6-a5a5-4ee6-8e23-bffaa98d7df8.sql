INSERT INTO public.user_roles (user_id, role)
VALUES ('dc7566a3-3ebf-478f-957e-e6598b130a44', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;