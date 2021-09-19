from flask import Flask, render_template, make_response, session
from flask import request, jsonify

def create_app(test = False, debug = True):
    app = Flask(__name__, static_url_path='/static')

    # Don't use cached template
    app.config['TEMPLATES_AUTO_RELOAD'] = True

    # Secret key is used to encrypt the session
    app.config['SECRET_KEY'] = '1dc6ad0cfb9e4fa9bbf7dbc66887a4f1'

    # import inside create app to have current app context
    with app.app_context():
        import {{cookiecutter.project_name}}.utils

    @app.route("/")
    def index():
        response = make_response(render_template('index.html'))
        return response

    return app

if __name__ == "__main__":
    create_app().run(host='0.0.0.0')