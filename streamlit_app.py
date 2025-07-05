import streamlit as st
import os

st.set_page_config(page_title="Random Video Chat", layout="centered")

st.title("Random Video Chat")

with open(os.path.join('static', 'index.html')) as f:
    html = f.read()

st.components.v1.html(html, height=600, width=800)

st.markdown(
    """\
### Usage
1. Run `python server.py` in one terminal.
2. In another terminal, run `streamlit run streamlit_app.py`.
3. Open the provided URL in your browser on two devices to chat.
"""
)
