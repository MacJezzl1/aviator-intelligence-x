import test from "node:test";
import assert from "node:assert/strict";
import { isServerConfiguredOwner, verifyBootstrapSecret, getEffectiveRole, hasAdminAccess, hasOwnerAccess } from "../lib/auth/rbac.ts";

test("isServerConfiguredOwner - verifies server-side email without client manipulation", () => {
  assert.equal(isServerConfiguredOwner("owner@aix-terminal.io"), true);
  assert.equal(isServerConfiguredOwner("OWNER@AIX-TERMINAL.IO"), true);
  assert.equal(isServerConfiguredOwner("attacker@evil.com"), false);
  assert.equal(isServerConfiguredOwner(null), false);
});

test("verifyBootstrapSecret - requires exact server bootstrap secret", () => {
  assert.equal(verifyBootstrapSecret("aix_super_secret_bootstrap_token_2026"), true);
  assert.equal(verifyBootstrapSecret("wrong_secret"), false);
  assert.equal(verifyBootstrapSecret(undefined), false);
});

test("getEffectiveRole - strictly enforces OWNER for configured server email", () => {
  const ownerProfile = { email: "owner@aix-terminal.io", role: "USER" };
  assert.equal(getEffectiveRole(ownerProfile), "OWNER");

  const regularProfile = { email: "regular@user.com", role: "USER" };
  assert.equal(getEffectiveRole(regularProfile), "USER");

  const adminProfile = { email: "admin@user.com", role: "ADMIN" };
  assert.equal(getEffectiveRole(adminProfile), "ADMIN");
});

test("hasAdminAccess and hasOwnerAccess - strictly guards permissions", () => {
  assert.equal(hasOwnerAccess("OWNER"), true);
  assert.equal(hasOwnerAccess("ADMIN"), false);
  assert.equal(hasOwnerAccess("USER"), false);

  assert.equal(hasAdminAccess("OWNER"), true);
  assert.equal(hasAdminAccess("ADMIN"), true);
  assert.equal(hasAdminAccess("USER"), false);
});
