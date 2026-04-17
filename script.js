const supabase = window.supabase.createClient(
  "https://rypkoxdenkuhmlyzbbnm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5cGtveGRlbmt1aG1seXpiYm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MTg2NDgsImV4cCI6MjA5MTk5NDY0OH0.nXu3HO5_steM5W4I4jtTQ3oT3OwwvZrh5jaBDT6gSW8"
);

function openModal() {
  document.getElementById("modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

async function createJob() {
  const flat = document.getElementById("flat").value;
  const issue = document.getElementById("issue").value;
  const priority = document.getElementById("priority").value;

  if (!flat || !issue) return alert("Fill all fields");

  await supabase.from("jobs").insert([
    { flat, issue, priority, status: "New" }
  ]);

  closeModal();
  loadJobs();
}

async function changeStatus(id, currentStatus) {
  let newStatus =
    currentStatus === "New" ? "In Progress" :
    currentStatus === "In Progress" ? "Completed" : "New";

  await supabase.from("jobs")
    .update({ status: newStatus })
    .eq("id", id);

  loadJobs();
}

async function loadJobs() {
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  const jobList = document.getElementById("jobList");
  jobList.innerHTML = "";

  document.getElementById("totalJobs").innerText = jobs.length;
  document.getElementById("openJobs").innerText =
    jobs.filter(j => j.status !== "Completed").length;
  document.getElementById("completedJobs").innerText =
    jobs.filter(j => j.status === "Completed").length;

  jobs.forEach(job => {
    const priorityClass =
      job.priority === "High" ? "high" :
      job.priority === "Medium" ? "medium" : "low";

    const statusClass =
      job.status === "New" ? "status-new" :
      job.status === "In Progress" ? "status-progress" : "status-done";

    jobList.innerHTML += `
      <div class="card">
        <div class="card-header">
          <strong>${job.flat}</strong>
          <span class="badge ${statusClass}">${job.status}</span>
        </div>

        <p>${job.issue}</p>

        <div class="card-footer">
          <span class="badge ${priorityClass}">${job.priority}</span>
          <button class="primary"
            onclick="changeStatus('${job.id}', '${job.status}')">
            Change Status
          </button>
        </div>

        <small>🕒 ${new Date(job.created_at).toLocaleTimeString()}</small>
      </div>
    `;
  });
}