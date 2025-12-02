FROM nginx:alpine

# Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
# frontend (static) 
COPY . /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
