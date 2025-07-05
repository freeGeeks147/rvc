# Random Video Chat (Python + Streamlit)

This repo implements a simple random video chat using WebRTC. The signaling server is written in Python and the UI is built with Streamlit.

## Getting Started

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the signaling server:
   ```bash
   python server.py
   ```
3. In another terminal, launch the Streamlit UI:
   ```bash
   streamlit run streamlit_app.py
   ```
4. Open the URL shown by Streamlit on two devices/browsers to start chatting.

The WebRTC connection uses a public TURN server for demonstration purposes. For production use, run your own TURN server.
