import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Rocket,
  Sparkles,
  Trash2,
  TrendingUp,
  LogOut,
  ShieldCheck,
  FireExtinguisher,
  SearchXIcon,
  Search,
} from "lucide-react";
import axios from "axios";
import { API } from "../App";
import { Button } from "components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { Input } from "components/ui/input";
import { Badge } from "components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "components/ui/alert";
import { Avatar, AvatarFallback } from "components/ui/avatar";
import { ScrollArea } from "components/ui/scroll-area";
import { Separator } from "components/ui/separator";

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isEditor = ["admin", "editor"].includes(currentUser.role);
  const initials = (currentUser.username || "Planner")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
    } catch (err) {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`${API}/projects`, formData);
      setSuccess("Project created successfully!");
      setDialogOpen(false);
      setFormData({ name: "", description: "" });
      fetchProjects();
      setTimeout(() => setSuccess(""), 3200);
      navigate(`/projects/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create project");
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this project? All delivery intelligence will be lost."
      )
    ) {
      return;
    }

    try {
      await axios.delete(`${API}/projects/${projectId}`);
      setSuccess("Project deleted successfully!");
      fetchProjects();
      setTimeout(() => setSuccess(""), 3200);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete project");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const haystack = `${project.name} ${project.description || ""}`.toLowerCase();
        return haystack.includes(searchTerm.toLowerCase());
      }),
    [projects, searchTerm]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-8 text-white shadow-2xl backdrop-blur">
          <div className="absolute -left-32 top-20 h-56 w-56 rounded-full bg-indigo-500/40 blur-3xl" aria-hidden="true" />
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-purple-500/30 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <Badge className="bg-white/20 text-white shadow" variant="secondary">
                <Sparkles className="mr-1 h-4 w-4" />Toshiba Software India Private Ltd
              </Badge>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                Project Plan
              </h1>
              <p className="text-sm text-indigo-100/90 sm:text-base">
                Launch, track, project plans in the organisation.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-indigo-100/80">
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1">
                  <Rocket className="h-4 w-4" />
                  <span>Showing {projects.length} Projects</span>
                </div>
                
              </div>
            </div>

            <Card className="w-full max-w-sm border-white/10 bg-slate-900/70 text-slate-50 shadow-xl backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="text-base text-slate-200">
                  {currentUser.username || "Planner"}
                </CardTitle>
                <CardDescription className="text-sm text-slate-400">
                  Welcome back ....
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-4 pb-0">
                <Avatar className="h-12 w-12 border border-white/20 bg-white/10">
                  <AvatarFallback className="bg-indigo-500 text-lg text-white">
                    {initials || "PM"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="capitalize">{currentUser.role || "viewer"}</span>
                  </div>
                  <p className="text-xs text-slate-500">Authenticated and synced </p>
                </div>
              </CardContent>
              <CardFooter className="mt-4 flex flex-wrap gap-2">
                {currentUser.role === "admin" && (
                  <Button
                    variant="outline"
                    className="border-white/20 bg-white/10 text-slate-100 hover:bg-white/20"
                    onClick={() => navigate("/admin")}
                    data-testid="admin-dashboard-btn"
                  >
                    Command Center
                  </Button>
                )}
                <Button
                  variant="destructive"
                  className="bg-rose-500 hover:bg-rose-600"
                  onClick={handleLogout}
                  data-testid="logout-btn"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <section className="space-y-6">
          {success && (
            <Alert className="border-emerald-500/40 bg-emerald-500/15 text-emerald-100">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" className="border-red-500/60 bg-red-500/15 text-red-100">
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="border-white/10 bg-slate-900/80 text-white shadow-2xl">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold">Plan Dashboard</CardTitle>
                <CardDescription className="text-slate-400">
                  Filter, launch, or revisit any project.
                </CardDescription>
              </div>
              {isEditor && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-500 hover:bg-indigo-600" data-testid="create-project-btn">
                      <Plus className="mr-2 h-4 w-4" /> Add Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border border-white/10 bg-slate-950/90 text-white">
                    <DialogHeader>
                      <DialogTitle>Add Project</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Give your project a name and optional briefing .
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateProject} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200" htmlFor="project-name">
                          Project name
                        </label>
                        <Input
                          id="project-name"
                          required
                          value={formData.name}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, name: event.target.value }))
                          }
                          placeholder="Enter Project Name"
                          className="border-white/20 bg-slate-900/80 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200" htmlFor="project-description">
                          Mission briefing (optional)
                        </label>
                        <textarea
                          id="project-description"
                          value={formData.description}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, description: event.target.value }))
                          }
                          placeholder="Enter Description."
                          className="min-h-[120px] w-full rounded-md border border-white/20 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        />
                      </div>
                      <DialogFooter className="sm:justify-between">
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-slate-300 hover:bg-white/10"
                          onClick={() => setDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-indigo-500 hover:bg-indigo-600">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Project
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full max-w-md">
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search for projects"
                    data-testid="search-projects"
                    className="border-white/10 bg-slate-900/70 pl-11 text-white placeholder:text-slate-500"
                  />
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-300" />
                </div>
                <Badge className="bg-indigo-500/20 text-indigo-100">
                  {filteredProjects.length} project{filteredProjects.length === 1 ? "" : "s"} in view
                </Badge>
              </div>
              <Separator className="border-white/10" />

              {loading ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-slate-300">
                  <Sparkles className="h-6 w-6 animate-spin text-indigo-300" />
                  <p className="text-sm">Fetching mission telemetry...</p>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-10 text-center text-slate-300">
                  <p className="text-lg font-semibold">No missions detected</p>
                  <p className="mt-2 text-sm text-slate-400">
                    {searchTerm
                      ? "Try a different search query or clear your filters."
                      : "Launch your first project to light up the dashboard."}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-full max-h-[600px] pr-2">
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredProjects.map((project) => (
                      <Card
                        key={project.id}
                        className="group flex cursor-pointer flex-col justify-between border-white/10 bg-slate-950/70 text-white transition duration-200 hover:border-indigo-400/60 hover:bg-slate-900/80"
                        onClick={() => navigate(`/projects/${project.id}`)}
                        data-testid={`project-card-${project.id}`}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <CardTitle className="text-xl font-semibold text-white group-hover:text-indigo-200">
                                {project.name}
                              </CardTitle>
                              <CardDescription className="mt-2 text-sm text-slate-400">
                                {project.description || "No briefing supplied yet."}
                              </CardDescription>
                            </div>
                            <Badge variant="secondary" className="bg-white/10 text-indigo-100">
                              {new Date(project.created_at).toLocaleDateString()}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardFooter className="flex items-center justify-between border-t border-white/5">
                          <span className="text-xs uppercase tracking-wide text-slate-500">
                            PID: {project.id.split("-")[0]}
                          </span>
                          {isEditor && (
                            <Button
                              variant="ghost"
                              className="text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteProject(project.id);
                              }}
                              data-testid={`delete-project-${project.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default ProjectsList;
