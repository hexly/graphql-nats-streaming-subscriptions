import { PubSubEngine } from "graphql-subscriptions";
import { PubSubAsyncIterator } from "./pubsub-async-iterator";

export class NatsPubSub implements PubSubEngine {
  private stan;
  private subscriptions = [];
  private subscriptionOptions: any;

  constructor(stan, subscriptionOptions: any) {
    this.stan = stan;
    this.subscriptionOptions = subscriptionOptions;
  }

  public async publish(subject: string, payload: any): Promise<void> {
    return await this.stan.publish(subject, payload);
  }

  public async subscribe(
    subject: string,
    onMessage: Function
  ): Promise<number> {
    try {
      const subscription = await this.stan.subscribe(
        subject,
        this.subscriptionOptions
      );
      subscription.on("message", onMessage);
      this.subscriptions[subscription.id] = subscription;
      return subscription;
    } catch (err) {
      throw err;
    }
  }

  public unsubscribe(sid: number) {
    var subscription = this.subscriptions[sid];
    if (subscription) {
      subscription.unsubscribe();
    }
  }

  public asyncIterator<T>(subjects: string | string[]): AsyncIterator<T> {
    return new PubSubAsyncIterator<T>(this, subjects);
  }
}
