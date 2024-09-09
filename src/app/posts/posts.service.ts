import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";

import { Post } from "./post.model";

@Injectable({ providedIn: "root" })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[]; postCount: number }>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: any; maxPosts: number }>(
        "http://localhost:3000/api/posts" + queryParams
      )
      .pipe(
        map(postData => {
          return {
            posts: postData.posts.map(post => {
              return {
                title: post.title,
                movie: post.movie,
                content: post.content,
                rating: post.rating,
                id: post._id,
                creator: post.creator,
                imagePath: post.imagePath,
                userName: post.userName
              };
            }),
            maxPosts: postData.maxPosts
          };
        })
      )
      .subscribe(transformedPostData => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts
        });
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{
      creator: string;
      _id: string;
      title: string;
      movie: string;
      content: string;
      rating: string;
      imagePath: string;
      userName: string;
    }>("http://localhost:3000/api/posts/" + id);
  }

  addPost(title: string, movie: string, content: string, rating: string, image: File, userName: string) {
    const postData = new FormData();
    postData.append("title", title);
    postData.append("movie", movie);
    postData.append("content", content);
    postData.append("rating", rating);
    postData.append("image", image, title);
    postData.append("userName", userName);
    this.http
      .post<{ message: string; post: Post }>(
        "http://localhost:3000/api/posts",
        postData
      )
      .subscribe(responseData => {
        this.router.navigate(["/"]);
      });
  }

  updatePost(id: string, title: string, movie: string, content: string, rating: string, image: File | string, userName: string, creator: string) {
    let postData: Post | FormData;
    if (typeof image === "object") {
      postData = new FormData();
      postData.append("id", id);
      postData.append("creator", creator);
      postData.append("title", title);
      postData.append("movie", movie);
      postData.append("content", content);
      postData.append("rating", rating);
      postData.append("image", image, title);
      postData.append("userName", userName);
    } else {
      postData = {
        id: id,
        creator: creator,
        title: title,
        movie: movie,
        content: content,
        rating: rating,
        imagePath: title,
        userName: userName,
      };
    }

    this.http
      .put("http://localhost:3000/api/posts/" + id, postData)
      .subscribe(responseData => {
        this.router.navigate(["/"]);
      });
  }

  deletePost(postId: string) {
    return this.http
      .delete("http://localhost:3000/api/posts/" + postId)
      .subscribe(responseData => {
        this.router.navigate(["/my-posts"]);
      });
  }


  getPostsByUserId(userId: string, postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: any; maxPosts: number }>(
        `http://localhost:3000/api/posts/user/${userId}` + queryParams
      )
      .subscribe((postData) => {
        this.posts = postData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: postData.maxPosts,
        });
      });
  }

  deleteMyPost(postId: string, userId: string) {
    const url = `http://localhost:3000/api/posts/user/${userId}`;
    return this.http.delete(url);
  }

}
