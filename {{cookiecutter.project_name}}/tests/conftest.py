import pytest
from {{cookiecutter.project_name_us}}.app import create_app

@pytest.fixture
def app():
    app = create_app(test=True)
    yield app

@pytest.fixture
def client(app):
    return app.test_client()
