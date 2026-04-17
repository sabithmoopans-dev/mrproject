const supabase = window.supabase.createClient(
  "https://rypkoxdenkuhmlyzbbnm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5cGtveGRlbmt1aG1seXpiYm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MTg2NDgsImV4cCI6MjA5MTk5NDY0OH0.nXu3HO5_steM5W4I4jtTQ3oT3OwwvZrh5jaBDT6gSW8"
);

let currentFilter = "ALL";

function openModal() {
  document.getElementById("modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

async function createJob() {
  const building = document.getElementById("building").value;
  const flat = document.getElementById("flat").value;
  const issue = document.getElementById("issue").value;
  const notes = document.getElementById("notes").value;
  const priority = document.getElementById("priority").value;
  const file = document.getElementById("image").files[0];

  if (!flat || !issue) return alert("Fill all fields");

  let imageUrl = null;

  if (file) {
    const fileName = Date.now() + "_" + file.name;

    const { error: uploadError } = await supabase.storage
      .from("job-images")
      .upload(fileName, file);

    if (!uploadError) {
      const { data } = supabase.storage
        .from("job-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }
  }

  await supabase.from("jobs").insert([
    {
      building,
      flat,
      issue,
      priority,
      notes,
      image_url: imageUrl,
      status: "New",
      is_read: false
    }
  ]);

  closeModal();
  loadJobs();
}

function filterBuilding(name) {
  currentFilter = name;
  loadJobs();
}

async function changeStatus(id, currentStatus) {
  let newStatus =
    currentStatus === "New" ? "In Progress" :
    currentStatus === "In Progress" ? "Completed" : "New";

  await supabase
    .from("jobs")
    .update({ status: newStatus, is_read: false })
    .eq("id", id);

  loadJobs();
}

async function markAsRead(id) {
  await supabase
    .from("jobs")
    .update({ is_read: true })
    .eq("id", id);

  loadJobs();
}

async function loadJobs() {
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const filtered = currentFilter === "ALL"
    ? jobs
    : jobs.filter(j => j.building === currentFilter);

  const jobList = document.getElementById("jobList");
  jobList.innerHTML = "";

  document.getElementById("totalJobs").innerText = jobs.length;
  document.getElementById("openJobs").innerText =
    jobs.filter(j => j.status !== "Completed").length;
  document.getElementById("completedJobs").innerText =
    jobs.filter(j => j.status === "Completed").length;

  filtered.forEach(job => {

    const priorityClass =
      job.priority === "High" ? "high" :
      job.priority === "Medium" ? "medium" : "low";

    const statusClass =
      job.status === "New" ? "status-new" :
      job.status === "In Progress" ? "status-progress" : "status-done";

    const unread = job.is_read ? "" : `<div class="notify-dot"></div>`;

    jobList.innerHTML += `
      <div class="card">
        ${unread}
        <div class="card-header">
          <strong>🏢 ${job.building} • ${job.flat}</strong>
          <span class="badge ${statusClass}">${job.status}</span>
        </div>

        <p>🔧 ${job.issue}</p>

        ${job.notes ? `<p class="notes">📝 ${job.notes}</p>` : ""}

        ${job.image_url ? `<img src="${job.image_url}" class="job-image">` : ""}

        <div class="card-footer">
          <span class="badge ${priorityClass}">${job.priority}</span>
          <div>
            <button class="primary"
              onclick="changeStatus('${job.id}', '${job.status}')">
              Update
            </button>
            <button onclick="markAsRead('${job.id}')">
              Mark Read
            </button>
          </div>
        </div>

        <small>🕒 ${new Date(job.created_at).toLocaleString()}</small>
      </div>
    `;
  });
}

supabase
  .channel('jobs-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'jobs' },
    () => loadJobs()
  )
  .subscribe();

loadJobs();