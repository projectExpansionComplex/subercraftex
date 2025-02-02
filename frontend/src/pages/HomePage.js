import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

const HomePage = () => {
  const countdown = useSelector((state) => state.countdown);
  const [timeLeft, setTimeLeft] = useState(countdown);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); 

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = moment.duration(
          moment().add(prev.days, 'days').add(prev.hours, 'hours').add(prev.minutes, 'minutes').add(prev.seconds, 'seconds').diff(moment())
        );
        return {
          days: newTime.days(),
          hours: newTime.hours(),
          minutes: newTime.minutes(),
          seconds: newTime.seconds(),
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('User Subscribed:', { name, email });

    // Reset fields after submission
    setName('');
    setEmail('');
  };

  return (
    <div className="bg-g1 size1 flex-w flex-col-c-sb p-l-15 p-r-15 p-t-55 p-b-35 respon1">
      <span></span>
      <div className="flex-col-c p-t-50 p-b-50">
        <h3 className="l1-txt1 txt-center p-b-10">Coming Soon</h3>
        <p className="txt-center l1-txt2 p-b-60">Our website is under construction</p>

        <div className="flex-w flex-c cd100 p-b-82">
          <div className="flex-col-c-m size2 how-countdown">
            <span className="l1-txt3 p-b-9">{timeLeft.days}</span>
            <span className="s1-txt1">Days</span>
          </div>

          <div className="flex-col-c-m size2 how-countdown">
            <span className="l1-txt3 p-b-9">{timeLeft.hours}</span>
            <span className="s1-txt1">Hours</span>
          </div>

          <div className="flex-col-c-m size2 how-countdown">
            <span className="l1-txt3 p-b-9">{timeLeft.minutes}</span>
            <span className="s1-txt1">Minutes</span>
          </div>

          <div className="flex-col-c-m size2 how-countdown">
            <span className="l1-txt3 p-b-9">{timeLeft.seconds}</span>
            <span className="s1-txt1">Seconds</span>
          </div>
        </div>

        {/* Button to Open Modal */}
        <button className="flex-c-m s1-txt2 size3 how-btn" data-bs-toggle="modal" data-bs-target="#subscribe">
          Follow us for update now!
        </button>
      </div>

      <span className="s1-txt3 txt-center">@ 2025 Coming Soon Template</span>

      {/* Modal */}
      <div className="modal fade" id="subscribe" tabIndex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-subscribe where1-parent bg0 bor2 size4 p-t-54 p-b-100 p-l-15 p-r-15">
            <button className="btn-close how-btn2 fs-26 where1 trans-04" data-bs-dismiss="modal"></button>
            <div class="wsize1 m-lr-auto">
					<h3 class="m1-txt1 txt-center p-b-36">
						<span class="bor1 p-b-6">Subscribe</span>
					</h3>

					<p class="m1-txt2 txt-center p-b-40">
						Follow us for update now!
					</p>
            {/* Form */}
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Name"
                className="form-control my-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="form-control my-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary w-100">
                Get Updates
              </button>
            </form>

            <p className="text-center mt-3">You can unsubscribe anytime.</p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
