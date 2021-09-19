import pytest

from flask import request

def test_app(app, client):
    with app.test_request_context():
        response = client.get('/')
        assert response.status_code == 200

