import { Request, Response, NextFunction } from "express";
import client from "../config/db";
import {
    DatabaseUser,
    HttpError,
    UserResponse,
    CreateUserResponse,
    UpdateUserResponse,
    SessionResponse,
    SessionUpdateResponse
} from "../helper/types";

// GET /users/:username - Get user by username
async function getUser(
    req: Request<{ username: string }>,
    res: Response<UserResponse | { error: string }>,
    next: NextFunction
): Promise<void> {
    try {
        const { username } = req.params;

        const { data, error } = await client.from("users_superset")
            .select("*")
            .eq("username", username)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // No rows returned
                res.status(404).json({ error: "User not found" });
                return;
            }
            return next(error);
        }

        res.json({ user: data as DatabaseUser });
    } catch (error) {
        next(error);
    }
}

// POST /users - Create a new user
async function createUser(
    req: Request<{}, CreateUserResponse | { error: string; details?: any }, Partial<DatabaseUser>>,
    res: Response<CreateUserResponse | { error: string; details?: any }>,
    next: NextFunction
): Promise<void> {
    try {
        const userData = req.body;

        // Validate required fields
        if (!userData.username) {
            res.status(400).json({ error: "Username is required" });
            return;
        }

        // Check if user already exists
        const { data: existingUser, error: checkError } = await client.from("users_superset")
            .select("username")
            .eq("username", userData.username)
            .single();

        // Handle the check error properly - PGRST116 means no rows found
        if (checkError && checkError.code !== 'PGRST116') {
            return next(checkError);
        }

        if (existingUser) {
            res.status(409).json({ error: "User already exists" });
            return;
        }

        const { data, error } = await client.from("users_superset")
            .insert([userData])
            .select()
            .single();

        if (error) {
            res.status(400).json({
                error: "Could not create user",
                details: error
            });
            return;
        }

        res.status(201).json({
            message: "User created successfully",
            user: data as DatabaseUser
        });
    } catch (error) {
        next(error);
    }
}

async function updateUser(
    req: Request<{ username: string }, UpdateUserResponse | { error: string; details?: any }, Partial<DatabaseUser>>,
    res: Response<UpdateUserResponse | { error: string; details?: any }>,
    next: NextFunction
): Promise<void> {
    try {
        const { username } = req.params;
        const updateData = req.body;

        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ error: "No update data provided" });
            return;
        }

        // Prevent username updates if it's in the update data
        if (updateData.username && updateData.username !== username) {
            res.status(400).json({ error: "Cannot change username via this endpoint" });
            return;
        }

        const { data, error } = await client.from("users_superset")
            .update(updateData)
            .eq("username", username)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                res.status(404).json({ error: "User not found" });
                return;
            }
            res.status(400).json({
                error: "Could not update user",
                details: error
            });
            return;
        }

        res.json({
            message: "User updated successfully",
            user: data as DatabaseUser
        });
    } catch (error) {
        next(error);
    }
}

// GET /users/:username/session - Get user session status
async function getUserSession(
    req: Request<{ username: string }>,
    res: Response<SessionResponse | { error: string }>,
    next: NextFunction
): Promise<void> {
    try {
        const { username } = req.params;
        const sessionLimit: number = 10; // minutes

        const { data, error } = await client.from("users_superset")
            .select("modified_date")
            .eq("username", username)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                res.status(404).json({ error: "User not found" });
                return;
            }
            return next(error);
        }

        const sessionStart = new Date(data.modified_date);
        const currentTime = new Date();
        const sessionDuration = Math.floor((currentTime.getTime() - sessionStart.getTime()) / 60000);
        const isExpired = sessionDuration >= sessionLimit;

        res.json({
            expired: isExpired,
            sessionDuration,
            sessionLimit,
            sessionStart: sessionStart.toISOString()
        });
    } catch (error) {
        next(error);
    }
}

// PUT /users/:username/session - Update/refresh user session
async function updateUserSession(
    req: Request<{ username: string }>,
    res: Response<SessionUpdateResponse | { error: string; details?: any }>,
    next: NextFunction
): Promise<void> {
    try {
        const { username } = req.params;

        const { data, error } = await client.from("users_superset")
            .update({ modified_date: new Date().toISOString() })
            .eq("username", username)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                res.status(404).json({ error: "User not found" });
                return;
            }
            res.status(400).json({
                error: "Could not update session",
                details: error
            });
            return;
        }

        res.json({
            message: "Session updated successfully",
            sessionStart: data.modified_date
        });
    } catch (error) {
        next(error);
    }
}

export {
    getUser,
    createUser,
    updateUser,
    getUserSession,
    updateUserSession
};