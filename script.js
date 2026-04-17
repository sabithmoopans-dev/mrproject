function getJobs() {
  return JSON.parse(localStorage.getItem("jobs")) || [];
}

function saveJobs(jobs) {
  localStorage.setItem("jobs", JSON.stringify(jobs));
}

function openModal() {
  document.getElementById("modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function createJob() {
  const flat = document.getElementById("flat").value;
  const issue = document.getElementById("issue").value;
  const priority = document.getElementById("priority").value;

  if (!flat || !issue) return alert("Fill all fields");

  const jobs = getJobs();

  jobs.push({
    flat,
    issue,
    priority,
    status: "New",
    time: new Date().toLocaleTimeString()
  });

  saveJobs(jobs);
  closeModal();
  loadJobs();
}

function changeStatus(index) {
  const jobs = getJobs();

  if (jobs[index].status === "New")
    jobs[index].status = "In Progress";
  else if (jobs[index].status === "In Progress")
    jobs[index].status = "Completed";
  else
    jobs[index].status = "New";

  saveJobs(jobs);
  loadJobs();
}

function loadJobs() {
  const jobs = getJobs();
  const jobList = document.getElementById("jobList");
  jobList.innerHTML = "";

  document.getElementById("totalJobs").innerText = jobs.length;
  document.getElementById("openJobs").innerText =
    jobs.filter(j => j.status !== "Completed").length;
  document.getElementById("completedJobs").innerText =
    jobs.filter(j => j.status === "Completed").length;

  jobs.forEach((job, index) => {
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
          <button class="primary" onclick="changeStatus(${index})">
            Change Status
          </button>
        </div>

        <small>🕒 ${job.time}</small>
      </div>
    `;
  });
}

loadJobs();