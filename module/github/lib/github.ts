import {Octokit} from "octokit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

/**
 * Getting the github access token
 */

export const getGithubToken = async()=>{
    const session = await auth.api.getSession({
        headers:await headers()
    })

    if(!session){
        throw new Error("Unauthorized")
    }

    // how i can access my account by passing the userid and then extract the access token

    const account = await prisma.account.findFirst({
        where:{
            userId:session.user.id,
            providerId:"github"
        }
    })

    if(!account?.accessToken){
        throw new Error("No github access token found")
    }

    return account.accessToken;

}

/** 
 * fetching the user contribution
 */

export async function fetchUserContributions(token:string , username:string) {
    const octokit = new Octokit({auth:token})

    const query = `
    query($username:String!){
        user(login:$username){
            contributionCollection {
                contributionCalendar{
                    totalContributions
                    weeks {
                        contributionDays {
                            contributionCount
                            date
                            color
                        }
                    }
                }
            }
        }
    }
    `
    // interface contributiondata {
    //     user: {
    //         contributionCollection: {
    //             contributionCalendar: {
    //                 totalContributions: number;
    //                 weeks: {
    //                     contributionDays: {
    //                         contributionCount: number;
    //                         date: string;
    //                         color: string;
    //                     }[];
    //                 }[];
    //             }
    //         }
    //     }
    // }

    try{
        const response: any = await octokit.graphql(query, {
            username
        })
        return response.user.contributionCollection.contributionCalendar
    } catch (error){

    }
}