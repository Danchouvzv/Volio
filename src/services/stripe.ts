/**
 * Represents a subscription.
 */
export interface Subscription {
  /**
   * The subscription ID.
   */
  id: string;
  /**
   * The status of the subscription.
   */
  status: string;
}

/**
 * Creates a subscription for a small organization.
 *
 * @param organizationId The ID of the organization to create the subscription for.
 * @returns A promise that resolves to a Subscription object.
 */
export async function createSubscription(organizationId: string): Promise<Subscription> {
  // TODO: Implement this by calling the Stripe API.

  return {
    id: 'sub_1234567890',
    status: 'active',
  };
}
