import { useCallback, useState } from 'react';
import { tasks as seedTasks, workspaces as seedWorkspaces } from '../data/demo';
import type { CustomerWorkspace, Task, WorkspaceField } from '../domain/nexus';

export type SectionDraftInput = {
  observation: string;
  evidenceSource: string;
};

const cloneWorkspaces = (): CustomerWorkspace[] =>
  seedWorkspaces.map((workspace) => ({
    ...workspace,
    sections: workspace.sections.map((section) => ({
      ...section,
      fields: section.fields.map((field) => ({ ...field, reusedIn: [...field.reusedIn] })),
    })),
  }));

const cloneTasks = (): Task[] => seedTasks.map((task) => ({ ...task }));

export function useNexusDemoState() {
  const [workspaces, setWorkspaces] = useState<CustomerWorkspace[]>(cloneWorkspaces);
  const [tasks, setTasks] = useState<Task[]>(cloneTasks);
  const [lastEvent, setLastEvent] = useState('Demo state initialized');

  const saveSectionDraft = useCallback(
    (workspaceId: string, sectionId: string, input: SectionDraftInput) => {
      const stamp = Date.now().toString();
      const fields: WorkspaceField[] = [
        {
          id: sectionId + '-rm-observation-' + stamp,
          label: 'RM observation',
          value: input.observation.trim(),
          source: input.evidenceSource.trim() || 'RM observation — source pending',
          evidenceState: input.evidenceSource.trim() ? 'unverified' : 'gap',
          enteredBy: 'rm',
          reusedIn: [],
        },
      ];

      setWorkspaces((current) =>
        current.map((workspace) =>
          workspace.id !== workspaceId
            ? workspace
            : {
                ...workspace,
                sections: workspace.sections.map((section) =>
                  section.id !== sectionId
                    ? section
                    : {
                        ...section,
                        status: 'in_progress',
                        progress: Math.max(section.progress, 55),
                        fields: [...section.fields, ...fields],
                      },
                ),
              },
        ),
      );
      setLastEvent('RM draft saved; evidence remains subject to verification');
    },
    [],
  );

  const submitSectionForReview = useCallback((workspaceId: string, sectionId: string) => {
    setWorkspaces((current) =>
      current.map((workspace) =>
        workspace.id !== workspaceId
          ? workspace
          : {
              ...workspace,
              sections: workspace.sections.map((section) =>
                section.id !== sectionId
                  ? section
                  : {
                      ...section,
                      status: 'needs_human_review',
                      progress: Math.max(section.progress, 80),
                    },
              ),
            },
      ),
    );
    setLastEvent('Section submitted to Team Lead review gate');
  }, []);

  const approveSection = useCallback((workspaceId: string, sectionId: string) => {
    setWorkspaces((current) =>
      current.map((workspace) =>
        workspace.id !== workspaceId
          ? workspace
          : {
              ...workspace,
              sections: workspace.sections.map((section) =>
                section.id !== sectionId
                  ? section
                  : { ...section, status: 'complete', progress: 100 },
              ),
            },
      ),
    );
    setLastEvent('Team Lead approved section in demo state');
  }, []);

  const returnSection = useCallback((workspaceId: string, sectionId: string) => {
    setWorkspaces((current) =>
      current.map((workspace) =>
        workspace.id !== workspaceId
          ? workspace
          : {
              ...workspace,
              sections: workspace.sections.map((section) =>
                section.id !== sectionId
                  ? section
                  : {
                      ...section,
                      status: 'in_progress',
                      progress: Math.min(section.progress, 79),
                    },
              ),
            },
      ),
    );
    setLastEvent('Section returned to RM for correction');
  }, []);

  const completeTask = useCallback((taskId: string) => {
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, status: 'complete' } : task)),
    );
    setLastEvent('Task marked complete with explicit user action');
  }, []);

  const reassignTask = useCallback((taskId: string, ownerId: string) => {
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, ownerId } : task)),
    );
    setLastEvent('Task owner changed');
  }, []);

  const resetDemo = useCallback(() => {
    setWorkspaces(cloneWorkspaces());
    setTasks(cloneTasks());
    setLastEvent('Demo state reset');
  }, []);

  return {
    workspaces,
    tasks,
    lastEvent,
    saveSectionDraft,
    submitSectionForReview,
    approveSection,
    returnSection,
    completeTask,
    reassignTask,
    resetDemo,
  };
}
