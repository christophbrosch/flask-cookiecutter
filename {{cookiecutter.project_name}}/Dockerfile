FROM python:3.8.6
WORKDIR /usr/src/app/

# The only two things which are needed in production.
# The whole nodejs side of things is just for building
# and therefore only import in a development setting.
COPY . .

RUN pip3 install -r requirements.txt

# Flag to not flut the whole output with tensorflow
ENV TF_CPP_MIN_LOG_LEVEL='3'
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "{{cookiecutter.project_name}}.app:create_app(debug=False)"]