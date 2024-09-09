import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";

import { Post } from "../post.model";
import { PostsService } from "../posts.service";
import { AuthService } from "../../auth/auth.service";
import { PageEvent } from "@angular/material/paginator";
import { Router } from "@angular/router";

@Component({
  selector: "app-my-posts",
  templateUrl: "./my-posts.component.html",
  styleUrls: ["./my-posts.component.css"]
})
export class MyPostsComponent implements OnInit, OnDestroy {

  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  userId: string;

  private postsSub: Subscription;
  private authStatusSub: Subscription;

  constructor(
    public postsService: PostsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.userId = this.authService.getId(); // Get the logged-in user's ID
    this.postsService.getPostsByUserId(this.userId, this.postsPerPage, this.currentPage); // Retrieve user's posts
    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((postData: { posts: Post[]; postCount: number }) => {
        this.isLoading = false;
        this.totalPosts = postData.postCount;
        this.posts = postData.posts;
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
      });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPostsByUserId(this.userId, this.postsPerPage, this.currentPage); // Retrieve user's posts for the new page
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService.deleteMyPost(postId, this.userId).subscribe(() => {
      this.postsService.getPostsByUserId(
        this.userId,
        this.postsPerPage,
        this.currentPage
      );
    });
  }


  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

  onEdit(postId: string) {
    if (postId) {
      this.router.navigate(["/edit", postId]);
    } else {
      console.error("Invalid postId:", postId);
      // Handle the case where postId is undefined or null
    }
  }

}
