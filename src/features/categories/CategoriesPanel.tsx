import { useEffect, useMemo, useState } from 'react'
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react'
import type { Category } from '../../types'
import { categoryCreate, categoryDelete, categoryUpdate, categoriesSubscribe } from './categoriesApi'
import { isFirebaseConfigured } from '../../firebase'

export function CategoriesPanel(props: { onCategoryPick?: (name: string) => void }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')

  useEffect(() => {
    let cleanup = () => {}
    categoriesSubscribe(setCategories).then((c) => {
      cleanup = c
    })
    return () => cleanup()
  }, [])

  const canUseFirebase = isFirebaseConfigured()

  const sortedNames = useMemo(() => categories.map((c) => c.name), [categories])

  const startCreate = () => {
    setEditing(null)
    setName('')
    setOpen(true)
  }

  const startEdit = (cat: Category) => {
    setEditing(cat)
    setName(cat.name)
    setOpen(true)
  }

  const save = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    if (!canUseFirebase) return
    if (editing) await categoryUpdate(editing.id, { name: trimmed })
    else await categoryCreate({ name: trimmed })
    setOpen(false)
  }

  const del = async (cat: Category) => {
    if (!canUseFirebase) return
    await categoryDelete(cat.id)
  }

  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb="xs">
        <Title order={5}>Categories</Title>
        <Button size="xs" leftSection={<IconPlus size={14} />} onClick={startCreate} disabled={!canUseFirebase}>
          Add
        </Button>
      </Group>

      {!canUseFirebase && (
        <Text size="sm" c="dimmed">
          Firebase is not configured yet. Add your `VITE_FIREBASE_*` env vars and restart.
        </Text>
      )}

      <Stack gap="xs" mt="sm">
        {sortedNames.length === 0 ? (
          <Text size="sm" c="dimmed">
            No categories yet.
          </Text>
        ) : (
          categories.map((c) => (
            <Group key={c.id} justify="space-between">
              <Badge
                variant="light"
                style={{ cursor: props.onCategoryPick ? 'pointer' : 'default' }}
                onClick={() => props.onCategoryPick?.(c.name)}
              >
                {c.name}
              </Badge>
              <Group gap={6}>
                <ActionIcon variant="subtle" onClick={() => startEdit(c)} disabled={!canUseFirebase} aria-label="Edit category">
                  <IconEdit size={16} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="red" onClick={() => del(c)} disabled={!canUseFirebase} aria-label="Delete category">
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Group>
          ))
        )}
      </Stack>

      <Modal opened={open} onClose={() => setOpen(false)} title={editing ? 'Edit category' : 'Add category'}>
        <Stack>
          <TextInput label="Name" placeholder="Food" value={name} onChange={(e) => setName(e.currentTarget.value)} />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!canUseFirebase || !name.trim()}>
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Card>
  )
}

