import { useListProjects, type Project as ApiProject } from "@/lib/api-client";
const gauSevaImage = "https://ik.imagekit.io/harshshukla/campaigns/legacy/gau-seva.jpg";
const dharmikSikshaImage = "https://ik.imagekit.io/harshshukla/projects/legacy/shiksha-seva.jpg";
const swachhAbhiyanImage = "https://ik.imagekit.io/harshshukla/projects/legacy/swach-seva.jpeg";
const foodDistributionImage = "https://ik.imagekit.io/harshshukla/campaigns/legacy/food-seva.jpg";
const medicalCampImage = "https://ik.imagekit.io/harshshukla/campaigns/legacy/medical-camp.jpg";

export type FoundationProject = ApiProject;

const featuredProjectFallbacks: FoundationProject[] = [
  {
    id: -2,
    title: "Dharmik Siksha",
    slug: "dharmik-siksha",
    description: "Passing on dharmic values, stories, and traditions to the next generation.",
    imageUrl: dharmikSikshaImage,
    imageFileId: null,
    imageFilePath: null,
    status: "completed",
    category: "Education",
    beneficiariesCount: null,
    startYear: 2024,
    endYear: null,
    budgetInr: null,
    location: null,
    membersInvolvedCount: null,
  },
  {
    id: -3,
    title: "Swachh Abhiyan",
    slug: "swachh-abhiyan",
    description: "Building cleaner temples, neighborhoods, and public spaces through collective action.",
    imageUrl: swachhAbhiyanImage,
    imageFileId: null,
    imageFilePath: null,
    status: "completed",
    category: "Community",
    beneficiariesCount: null,
    startYear: 2024,
    endYear: null,
    budgetInr: null,
    location: null,
    membersInvolvedCount: null,
  },
  {
    id: -4,
    title: "Food Distribution",
    slug: "food-distribution",
    description: "Serving nourishing meals to families, pilgrims, and communities in need.",
    imageUrl: foodDistributionImage,
    imageFileId: null,
    imageFilePath: null,
    status: "completed",
    category: "Seva",
    beneficiariesCount: null,
    startYear: 2024,
    endYear: null,
    budgetInr: null,
    location: null,
    membersInvolvedCount: null,
  },
  {
    id: -5,
    title: "Medical Camp",
    slug: "medical-camp",
    description: "Connecting underserved communities with essential health checks and care.",
    imageUrl: medicalCampImage,
    imageFileId: null,
    imageFilePath: null,
    status: "completed",
    category: "Healthcare",
    beneficiariesCount: null,
    startYear: 2024,
    endYear: null,
    budgetInr: null,
    location: null,
    membersInvolvedCount: null,
  },
];

export function getFeaturedProjectFallback(id: number): FoundationProject | undefined {
  return featuredProjectFallbacks.find((project) => project.id === id);
}

function projectMatches(left: FoundationProject, right: ApiProject): boolean {
  return left.slug === right.slug || left.title.trim().toLowerCase() === right.title.trim().toLowerCase();
}

function mergeProject(fallback: FoundationProject, apiProject: ApiProject): FoundationProject {
  return {
    ...fallback,
    ...apiProject,
    imageUrl: apiProject.imageUrl ?? fallback.imageUrl,
  };
}

export function useFoundationProjects() {
  const query = useListProjects();
  const apiProjects = query.data ?? [];

  const projects = [
    ...featuredProjectFallbacks.map((fallback) => {
      const apiProject = apiProjects.find((project) => projectMatches(fallback, project));
      return apiProject ? mergeProject(fallback, apiProject) : fallback;
    }),
    ...apiProjects
      .filter((project) => !featuredProjectFallbacks.some((fallback) => projectMatches(fallback, project)))
      .map((project) => ({ ...project })),
  ];

  return {
    ...query,
    projects,
  };
}