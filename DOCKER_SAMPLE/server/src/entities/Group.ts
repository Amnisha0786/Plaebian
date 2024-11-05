import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from "typeorm";

import { Account } from "./Account";

@Entity()
@Tree("materialized-path")
export class Group extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @TreeParent()
  parent: Group;

  @TreeChildren()
  children: Group[];

  // @JoinTable()
  @OneToMany(() => Account, (account) => account.group)
  members: Account[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;

  without(keys: (keyof Group)[]): Partial<Group> {
    const copy = { ...(this as any) };
    keys.forEach((key) => delete copy[key]);
    return copy;
  }

  /**
   * An alias for withoutMembers
   */
  get withoutAccounts(): Omit<Group, "members"> {
    return this.without(["members"]) as Omit<Group, "members">;
  }

  /**
   * An alias for withoutAccounts
   */
  get withoutMembers(): Omit<Group, "members"> {
    return this.withoutAccounts;
  }

  get withoutChildren(): Omit<Group, "children"> {
    return this.without(["children"]) as Omit<Group, "children">;
  }

  get withoutParent(): Omit<Group, "parent"> {
    return this.without(["parent"]) as Omit<Group, "parent">;
  }

  static async attachChild(parent: Group, child?: Group): Promise<Group> {
    if (!child) return parent;
    if (!parent.children?.find((c) => c.id === child.id)) {
      child.parent = parent;
      await child.save();
    }
    return parent;
  }

  static async createIfDoesntExist(name: string): Promise<Group> {
    const group = await Group.findOne({ where: { name } });
    if (!group) {
      const newGroup = new Group();
      newGroup.name = name;
      await newGroup.save();
      return newGroup;
    }
    return group;
  }

  static async createIfHierarchyDoesntExist(
    names: string[]
  ): Promise<Group | null> {
    if (names.length === 0) return null;

    const newGroups = await Promise.all(
      names.map(async (name) => await Group.createIfDoesntExist(name))
    );

    if (newGroups?.length === 0) return null;

    let parent: Group | null | undefined = newGroups.shift();
    if (!parent) return null;
    let oldestParent: Group | null = parent;

    while (newGroups.length > 0) {
      if (!parent) break;
      const oldParent = parent;
      parent = newGroups.shift();
      if (parent) {
        await Group.attachChild(oldParent, parent);
      }
    }

    return oldestParent;
  }

  static async createGroupsIfNotExist(groups: string[]) {
    const groupObjects: Group[] = [];
    for (const g of groups) {
      // find which groups do not exist and create them
      let find = await Group.findOne({ where: { name: g } });
      if (!find) {
        find = new Group();
        find.name = g;
        await find.save();
      }
      groupObjects.push(find);
    }

    for (let i = 0; i < groupObjects.length - 1; i++) {
      if (!groupObjects[i].children) groupObjects[i].children = [];
      groupObjects[i].children.push(groupObjects[i + 1]);
      await groupObjects[i].save();
    }

    // return groupObjects[-1];
    return groupObjects[groupObjects.length - 1];
  }

  static async printTree(group: Group, depth = 0) {
    await group.reload();
    console.log("-".repeat(depth) + group.name);
    if (group.children?.length > 0) {
      group.children.forEach(async (child) => {
        await Group.printTree(child, depth + 1);
      });
    }
  }

  static async testHierarchy(names: string[]) {
    const parent = await Group.createIfHierarchyDoesntExist(names);
    this.printTree(parent!);
  }
}
