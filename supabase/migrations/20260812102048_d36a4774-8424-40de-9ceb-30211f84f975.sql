ALTER TABLE public.seat_requests REPLICA IDENTITY FULL;
ALTER TABLE public.complaints REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.seat_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;