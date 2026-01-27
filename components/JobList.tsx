import JobCard from './JobCard';
import type { Job } from '../types/job';

interface Props {
  jobs: Job[];
}

export default function JobList({ jobs }: Props) {
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}