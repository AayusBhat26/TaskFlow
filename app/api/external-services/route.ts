import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ExternalServicesAggregator } from "@/services/external";

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's external service usernames
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        leetcodeUsername: true,
        codeforcesUsername: true,
        redditUsername: true,
        githubUsername: true,
        emailIds: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has any external services configured
    const hasExternalServices = 
      user.leetcodeUsername ||
      user.codeforcesUsername ||
      user.redditUsername ||
      user.githubUsername ||
      (user.emailIds && user.emailIds.length > 0);

    if (!hasExternalServices) {
      return NextResponse.json({
        message: "No external services configured",
        data: null,
      });
    }

    // Initialize the aggregator
    const aggregator = new ExternalServicesAggregator({
      // In production, these would come from environment variables or user settings
      githubToken: process.env.GITHUB_TOKEN,
      gmailAccessToken: process.env.GMAIL_ACCESS_TOKEN,
      updateInterval: 60, // 1 hour
    });

    // Fetch data from all configured services
    const externalData = await aggregator.fetchAllUserData({
      leetcodeUsername: user.leetcodeUsername,
      codeforcesUsername: user.codeforcesUsername,
      redditUsername: user.redditUsername,
      githubUsername: user.githubUsername,
      emailIds: user.emailIds || [],
    });

    // Generate insights and daily digest
    const insights = aggregator.generateUserInsights(externalData);
    const dailyDigest = aggregator.generateDailyDigest(externalData);

    return NextResponse.json({
      success: true,
      data: {
        ...externalData,
        insights,
        dailyDigest,
      },
    });
  } catch (error) {
    console.error("Error fetching external services data:", error);
    return NextResponse.json(
      { error: "Failed to fetch external services data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { service, username } = await request.json();

    if (!service || !username) {
      return NextResponse.json(
        { error: "Service and username are required" },
        { status: 400 }
      );
    }

    const aggregator = new ExternalServicesAggregator({
      githubToken: process.env.GITHUB_TOKEN,
      gmailAccessToken: process.env.GMAIL_ACCESS_TOKEN,
      updateInterval: 60,
    });

    let data = null;

    // Fetch data for specific service
    switch (service.toLowerCase()) {
      case 'codeforces':
        data = await aggregator.fetchCodeforcesData(username);
        break;
      case 'github':
        data = await aggregator.fetchGitHubData(username);
        break;
      case 'reddit':
        data = await aggregator.fetchRedditData(username);
        break;
      default:
        return NextResponse.json(
          { error: "Unsupported service" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      service,
      data,
    });
  } catch (error) {
    console.error("Error fetching specific service data:", error);
    return NextResponse.json(
      { error: "Failed to fetch service data" },
      { status: 500 }
    );
  }
}
