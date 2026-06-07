<script setup lang="ts">
definePageMeta({ auth: true });

const activeTab = ref("account");
const { user } = useUserSession();
</script>

<template>
  <div class="space-y-6">
    <p class="text-sm text-muted-foreground">Workspace and account configuration.</p>

    <Tabs v-model="activeTab" default-value="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="workspace">Workspace</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardContent class="pt-6">
            <dl class="grid gap-4 text-sm">
              <div>
                <dt class="text-muted-foreground">Email</dt>
                <dd>{{ user?.email ?? "—" }}</dd>
              </div>
              <div>
                <dt class="text-muted-foreground">Name</dt>
                <dd>{{ user?.name ?? "—" }}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="workspace">
        <Card>
          <CardContent class="pt-6">
            <dl class="grid gap-4 text-sm">
              <div>
                <dt class="text-muted-foreground">Workspace ID</dt>
                <dd class="font-mono">{{ user?.workspaceId ?? "—" }}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
