export const LEETCODE_GRAPHQL_ENDPOINT = "https://leetcode.com/graphql";

export const USER_CHECK_QUERY = `
  query userPublicProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        realName
        userAvatar
        ranking
      }
    }
  }
`;

export const USER_STATS_QUERY = `
  query userProblemsSolved($username: String!) {
    matchedUser(username: $username) {
      username
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      submissionCalendar
    }
    userContestRanking(username: $username) {
      attendedContestsCount
      rating
      globalRanking
      totalParticipants
      topPercentage
    }
    recentAcSubmissionList(username: $username, limit: 20) {
      id
      title
      titleSlug
      timestamp
      statusDisplay
      lang
    }
  }
`;