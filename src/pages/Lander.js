import './land.css';
import hero from '../theme/images/hero.png';
import settingsPic  from '../theme/images/settingsimg.png';
import homePic  from '../theme/images/home.png';
import { Link } from 'react-router-dom';
import WOW from "wowjs";
import { useEffect } from 'react';

const Lander = () => {
    useEffect(() => {
        const wow = new WOW.WOW()
        wow.init()
    })
    return (
        <div id="land">
            <section id="hero">
                <nav class="navbar navbar-light bg-transparent lander-nav py-3">
                    <a class="navbar-brand mx-4 text-light"><i class="fas fa-bomb"/> <span class="d-none d-md-inline text-light">WillyChat</span></a>
                    <ul class="mr-auto list-inline">
                        <li class="list-inline-item mx-2">
                            <Link to="/register" className="nav-link text-light badge-light badge-pill text-dark">
                            Register
                            </Link>
                        </li>
                        <li class="list-inline-item mx-4">
                            <Link to="/login" className="nav-link text-light">
                            Login
                            </Link>
                        </li>
                    </ul>
                </nav>
                <div class="container col-xxl-8 px-4 py-5">
                    <div class="row flex-lg-row-reverse align-items-center g-5 py-5">
                        <div class="col-10 col-sm-8 col-lg-6">
                            <img src={hero} class="d-block mx-lg-auto img-fluid wow fadeInDown" width="700" height="500" loading="lazy"/>
                        </div>
                        <div class="col-lg-6 wow fadeInDown">
                            <h1 class="display-5 fw-bold lh-1 mb-3">WillyChat: Instant Messaging Platform</h1>
                            <p class="lead">Join a server and interact with other users in real time. Create your own server and customize it how you see fit. Make friends and privately message them, all in real time.</p>
                            <div class="d-grid gap-2 d-md-flex justify-content-md-start mb-4 mb-lg-3">
                                <Link to="/register" className="btn btn-success btn-lg px-4 me-md-2 fw-bold">Register</Link>
                                <Link to="/login" className="btn btn-secondary btn-lg px-4 me-md-2 fw-bold">Login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section class="wave-container">
                <div class="wave"></div>
            </section>
            <section id="server-info">
                <div class="container my-5">
                    <div class="row p-4 pb-0 pe-lg-0 pt-lg-5 align-items-center text-dark">
                        <div class="col-lg-4 offset-lg-1 p-0 overflow-hidden shadow-lg">
                            <img class="rounded-lg-3 wow fadeInDown" data-wow-offset="100" src={settingsPic} alt="Server settings" width="720"/>
                        </div>
                        <div class="col-lg-7 p-3 p-lg-5 pt-lg-3">
                            <h1 class="display-4 fw-bold lh-1 wow fadeInDown">Run your server how you want</h1>
                            <p class="lead wow fadeInDown">You can kick, ban and delete any messages in any server that you are the owner of. You can also appoint server members to be moderators to keep your community safe</p>
                        </div>
                    </div>
                </div>
            </section>
            <section id="social-info">
                <div class="container my-5">
                        <div class="row p-4 pb-0 pe-lg-0 pt-lg-5 align-items-center text-dark">
                            <div class="col-lg-7 p-3 p-lg-5 pt-lg-3 wow fadeInDown">
                                <h1 class="display-4 fw-bold lh-1">Keep up with friends in real time</h1>
                                <p class="lead">Send and accept friend requests and send private messages to any user. Don't miss a message with WillyChat's real time notification system! If a user is bothering you, there is also a handy block button</p>
                            </div>
                            <div class="col-lg-4 offset-lg-1 p-0 overflow-hidden shadow-lg wow fadeInDown">
                                <img class="rounded-lg-3" src={homePic} alt="Server settings" width="720"/>
                            </div>
                        </div>
                    </div>
            </section>
            <section id="getStarted">
                <div class="container my-5">
                    <div class="row p-4 pb-0 pe-lg-0 pt-lg-5 align-items-center text-dark">
                        <div class="col-12 p-3 p-lg-5 pt-lg-5 text-center">
                            <h1 class="display-4 fw-bold lh-1 text-center wow fadeInDown">Ready to get started?</h1>
                            <Link to="/register" className="btn btn-success btn-lg px-4 me-md-2 fw-bold text-center align-self-center my-5 wow fadeInDown">Join Now!</Link>

                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Lander