import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription
} from "../controllers/subscription.controllers.js";
import { verifyJwt } from '../middlewares/auth.middleware.js';
const subscriptionRouter = Router();
subscriptionRouter.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file

subscriptionRouter
    .route("/c/:channelId")
    .get(getUserChannelSubscribers)
    .post(toggleSubscription);

    
subscriptionRouter.route("/u/:subscriberId").get(getSubscribedChannels);

export  {subscriptionRouter}