import { Request, Response, NextFunction } from 'express';
import client from '../config/db';
import { doesEntryExist } from '../utils/tableManager';
import { 
    AddProjectRequest, 
    FetchProjectsQuery, 
    DatabaseProject, 
    ProjectResponse 
} from '../helper/types';

async function addProject(
    req: Request,
    res: Response, 
    next: NextFunction
): Promise<Response | void> {
    try {
        const { user, repolink }= req.body as AddProjectRequest;
        const tablename: string = "projects";
        const column: string = "repourl";

        if (!user || !repolink) {
            return res.status(400).json({ error: "Missing user or repository link" });
        }

        const exists: boolean = await doesEntryExist(tablename, column, repolink);
        if (exists) {
            return res.status(200).json({
                message: `${repolink} repo already exists`,
                data: []
            });
        }

        const { data, error } = await client
            .from(tablename)
            .insert([{ user: user, repourl: repolink }])
            .select();

        if (error) {
            return res.status(500).json({ error: "Database error", details: error });
        }

        return res.status(200).json({
            message: `Project added successfully to ${tablename}`,
            data: data as DatabaseProject[]
        });
    } catch (error) {
        next(error);
    }
}

// Common function to fetch user data and 
async function fetchProject(
    req: Request,
    res: Response, 
    next: NextFunction
): Promise<Response | void> {
    try {
        const { user, table }= req.query as FetchProjectsQuery;
        
        if (!table) {
            return res.status(400).json({ error: "Missing table parameter" });
        }

        const { data, error } = await client
            .from(table)
            .select("*")
            .eq('user', user);
        
        if (error) {
            return next(error);
        }
        
        return res.json(data as DatabaseProject[]);
    } catch (error) {
        next(error);
    }
}

export {
    addProject,
    fetchProject
};