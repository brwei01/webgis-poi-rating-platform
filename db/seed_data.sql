-- Insert a default user for testing
INSERT INTO ucfscde.users (user_name) 
VALUES ('default_user')
ON CONFLICT (user_name) DO NOTHING;

-- Insert condition options
INSERT INTO cege0043.asset_condition_options (condition_description)
VALUES 
 ('Element is in very good condition'),
 ('Some aesthetic defects, needs minor repair'),
 ('Functional degradation of some parts, needs maintenance'),
 ('Not working and maintenance must be done as soon as reasonably possible'),
 ('Not working and needs immediate, urgent maintenance'),
 ('Unknown')
ON CONFLICT (condition_description) DO NOTHING;
