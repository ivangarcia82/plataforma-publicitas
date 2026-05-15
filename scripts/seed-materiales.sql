INSERT INTO "MaterialDigital" (id, nombre, descripcion, categoria, url, tipo, "createdAt", "updatedAt") VALUES
  ('mat_expo_info', 'Información Expo Publicitas', 'Información general del evento', 'Presentaciones', '/uploads/ExpoPublicitas.Información.png', 'png', NOW(), NOW()),
  ('mat_gim_uber', 'GIM Uber - Expo Publicitas', 'Información de Uber para asistentes GIM', 'Otro', '/uploads/GIM.ExpoPublicitas.Uber.jpg', 'jpg', NOW(), NOW()),
  ('mat_gim_mailing', 'GIM Mailing Beneficios', 'Mailing con beneficios para GIM', 'Otro', '/uploads/GIM.Mailing.ExpoPublicitas.Beneficios.jpg', 'jpg', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
