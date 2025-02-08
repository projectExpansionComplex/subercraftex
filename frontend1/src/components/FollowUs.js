import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap is loaded
import "./FollowUs.css"; // Add this file for extra styling if needed

const FollowUs = () => {
  const [show, setShow] = useState(false);

  return (
    <div className="follow-us-container">
      {/* Button to Open Modal */}
      <button className="btn btn-primary follow-btn" onClick={() => setShow(true)}>
        Follow Us for Updates
      </button>

      {/* Modal */}
      {show && (
        <div className="modal fade show d-block" style={{ background: "rgba(0, 0, 0, 0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Subscribe</h3>
                <button type="button" className="close" onClick={() => setShow(false)}>
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <p>Follow us for updates now!</p>
                <form>
                  <div className="form-group">
                    <input type="text" className="form-control" placeholder="Name" required />
                  </div>
                  <div className="form-group">
                    <input type="email" className="form-control" placeholder="Email" required />
                  </div>
                  <button type="submit" className="btn btn-success w-100">
                    Get Updates
                  </button>
                </form>
              </div>
              <div className="modal-footer">
                <small>We hate spam too! You can unsubscribe anytime.</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUs;
