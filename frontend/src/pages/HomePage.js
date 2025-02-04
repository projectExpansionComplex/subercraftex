import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { getDataAPI } from '../utils/fetchData';
const HomePage = () => {
 const [countdown, setCountdown] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
  });
  const [timeLeft, setTimeLeft] = useState(countdown);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comingSoon, setComingSoon] = useState(null);
  

  // Handle countdown
  useEffect(() => {
    // For testing, if no releaseDate is available, use a date 10 days from now
    console.log(comingSoon, 'the release date')
    const targetDate = comingSoon?.launchDate
      ? new Date(comingSoon.launchDate).getTime()
      : new Date().getTime() + 10 * 24 * 60 * 60 * 1000;
     

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      
      // Log for debugging
      console.log('Updating countdown. Distance:', distance);

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountdown({
          days: days.toString().padStart(2, '0'),
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0')
        });

        // Log for debugging
        console.log('New countdown state:', { days, hours, minutes, seconds });
      }
    };

    // Update immediately
    updateCountdown();
    
    // Set up interval
    const interval = setInterval(updateCountdown, 1000);

    // Clean up
    return () => clearInterval(interval);
  }, [comingSoon]);

  useEffect(() => {
    const getcommingsoon = async () => {
      try {
        const res = await getDataAPI('coming-soon')
        console.log(res, 'the res data')
        setComingSoon(res.data);
        startCountdown(res.data.launchDate);
      } catch (error) {
        console.error('Error fetching coming soon details:', error);
      }
    }
    getcommingsoon()
  }, []);

  const startCountdown = (launchDate) => {
    const timer = setTimeout(() => {
      const endDate = moment(launchDate);
      const now = moment();
      const duration = moment.duration(endDate.diff(now));

      if (duration.asSeconds() <= 0) {
        clearTimeout(timer);
      }

      setTimeLeft({
        days: duration.days(),
        hours: duration.hours(),
        minutes: duration.minutes(),
        seconds: duration.seconds(),
      });
    }, 1000);

    return () => clearTimeout(timer);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('User Subscribed:', { name, email });
    setName('');
    setEmail('');
  };

  if (!comingSoon) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-g1 size1 flex-w flex-col-c-sb p-l-15 p-r-15 p-t-55 p-b-35 respon1">
      <span></span>
      <div className="flex-col-c p-t-50 p-b-50">
        <h3 className="l1-txt1 txt-center p-b-10">Coming Soon</h3>
        <p className="txt-center l1-txt2 p-b-60">Our website is under construction</p>

        <div className="flex-w flex-c cd100 p-b-82">
          <div className="flex-col-c-m size2 how-countdown">
            <span className="l1-txt3 p-b-9">{countdown.days}</span>
            <span className="s1-txt1">Days</span>
          </div>

          <div className="flex-col-c-m size2 how-countdown">
            <span className="l1-txt3 p-b-9">{countdown.hours}</span>
            <span className="s1-txt1">Hours</span>
          </div>

          <div className="flex-col-c-m size2 how-countdown">
            <span className="l1-txt3 p-b-9">{countdown.minutes}</span>
            <span className="s1-txt1">Minutes</span>
          </div>

          <div className="flex-col-c-m size2 how-countdown">
            <span className="l1-txt3 p-b-9">{countdown.seconds}</span>
            <span className="s1-txt1">Seconds</span>
          </div>
        </div>

        <button className="flex-c-m s1-txt2 size3 how-btn" data-bs-toggle="modal" data-bs-target="#subscribe">
          Follow us for update now!
        </button>
      </div>

      <span className="s1-txt3 txt-center">@ 2025 Coming Soon Template</span>

      <div className="modal fade" id="subscribe" tabIndex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-subscribe where1-parent bg0 bor2 size4 p-t-54 p-b-100 p-l-15 p-r-15">
            <button className="btn-close how-btn2 fs-26 where1 trans-04" data-bs-dismiss="modal"></button>
            <div className="wsize1 m-lr-auto">
              <h3 className="m1-txt1 txt-center p-b-36">
                <span className="bor1 p-b-6">Subscribe</span>
              </h3>

              <p className="m1-txt2 txt-center p-b-40">
                Follow us for update now!
              </p>

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
